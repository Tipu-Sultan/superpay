import { Types } from 'mongoose';
import {
  Transaction,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionDoc,
  type TransactionStatus,
  type TransactionType,
} from '../models';
import type { TransactionDTO } from '../types/dto';
import { ApiError } from '../utils/ApiError';
import { escapeRegex } from '../utils/regex';
import { debit, credit } from './wallet.service';
import { getPaymentGateway } from './payment';

type TxnLike = Pick<
  TransactionDoc,
  | 'txnId' | 'type' | 'direction' | 'status' | 'amountPaise' | 'counterparty' | 'note'
  | 'paymentMethod' | 'referenceNo' | 'meta' | 'failureReason' | 'createdAt' | 'completedAt'
> & { _id: unknown };

/** Explicit mapping so internal fields (user, idempotencyKey, settled) never leak to clients. */
export function serializeTransaction(t: TxnLike): TransactionDTO {
  return {
    id: String(t._id),
    txnId: t.txnId,
    type: t.type,
    direction: t.direction,
    status: t.status,
    amountPaise: t.amountPaise,
    counterparty: {
      name: t.counterparty.name,
      mobile: t.counterparty.mobile ?? undefined,
      upiId: t.counterparty.upiId ?? undefined,
      contactId: t.counterparty.contactId ? String(t.counterparty.contactId) : undefined,
    },
    note: t.note ?? undefined,
    paymentMethod: t.paymentMethod,
    referenceNo: t.referenceNo,
    meta: (t.meta as Record<string, unknown> | undefined) ?? undefined,
    failureReason: t.failureReason ?? undefined,
    createdAt: new Date(t.createdAt).toISOString(),
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
  };
}

export interface ListTransactionsParams {
  userId: string;
  type?: TransactionType;
  status?: TransactionStatus;
  q?: string;
  limit: number;
  cursor?: string;
}

export interface TransactionPage {
  items: TransactionDTO[];
  nextCursor: string | null;
}

function encodeCursor(createdAt: Date, id: unknown): string {
  return Buffer.from(`${createdAt.getTime()}:${String(id)}`).toString('base64url');
}

function decodeCursor(cursor: string): { date: Date; id: Types.ObjectId } {
  try {
    const [ms, id] = Buffer.from(cursor, 'base64url').toString('utf8').split(':');
    if (!ms || !id || !Types.ObjectId.isValid(id)) throw new Error('bad cursor');
    return { date: new Date(Number(ms)), id: new Types.ObjectId(id) };
  } catch {
    throw ApiError.badRequest('Invalid pagination cursor.');
  }
}

export async function listTransactions(params: ListTransactionsParams): Promise<TransactionPage> {
  const filter: Record<string, unknown> = { user: new Types.ObjectId(params.userId) };
  if (params.type) filter.type = params.type;
  if (params.status) filter.status = params.status;

  const and: Record<string, unknown>[] = [];
  if (params.q) {
    const rx = new RegExp(escapeRegex(params.q.trim()), 'i');
    and.push({ $or: [{ 'counterparty.name': rx }, { txnId: rx }, { note: rx }, { referenceNo: rx }, { 'counterparty.upiId': rx }] });
  }
  if (params.cursor) {
    const { date, id } = decodeCursor(params.cursor);
    and.push({ $or: [{ createdAt: { $lt: date } }, { createdAt: date, _id: { $lt: id } }] });
  }
  if (and.length) filter.$and = and;

  const docs = await Transaction.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(params.limit + 1)
    .lean();

  const hasMore = docs.length > params.limit;
  const page = hasMore ? docs.slice(0, params.limit) : docs;
  const last = page[page.length - 1];

  return {
    items: page.map((d) => serializeTransaction(d as unknown as TxnLike)),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last._id) : null,
  };
}

/** Looks up by public txnId or Mongo id, scoped to the owner. */
export async function getTransaction(userId: string, idOrTxnId: string): Promise<TransactionDoc> {
  const byId = Types.ObjectId.isValid(idOrTxnId) ? { _id: idOrTxnId } : { txnId: idOrTxnId };
  const doc = await Transaction.findOne({ user: userId, ...byId });
  if (!doc) throw ApiError.notFound('Transaction not found.');
  return doc;
}

/**
 * Re-checks a pending transaction with the gateway and, if it succeeded,
 * moves the wallet balance exactly once.
 */
export async function refreshPendingTransaction(userId: string, idOrTxnId: string): Promise<TransactionDoc> {
  const txn = await getTransaction(userId, idOrTxnId);
  if (txn.status !== 'pending') return txn;

  const result = await getPaymentGateway().checkPending({
    txnId: txn.txnId,
    createdAt: txn.createdAt,
    referenceNo: txn.referenceNo,
    counterparty: {
      name: txn.counterparty.name,
      mobile: txn.counterparty.mobile ?? undefined,
      upiId: txn.counterparty.upiId ?? undefined,
    },
  });

  if (result.outcome === 'pending') return txn;

  if (result.outcome === 'failed') {
    await Transaction.updateOne(
      { _id: txn._id, status: 'pending' },
      { $set: { status: 'failed', failureReason: result.reason ?? 'Payment failed.', completedAt: new Date() } },
    );
    return getTransaction(userId, String(txn._id));
  }

  // success: move money first, then flip the status; undo the money if we lost a race.
  const moved =
    txn.direction === 'debit' ? await debit(userId, txn.amountPaise) : await credit(userId, txn.amountPaise);

  if (moved === null) {
    await Transaction.updateOne(
      { _id: txn._id, status: 'pending' },
      { $set: { status: 'failed', failureReason: 'Insufficient wallet balance when the payment was confirmed.', completedAt: new Date() } },
    );
    return getTransaction(userId, String(txn._id));
  }

  const updated = await Transaction.updateOne(
    { _id: txn._id, status: 'pending' },
    { $set: { status: 'success', settled: true, completedAt: new Date() }, $unset: { failureReason: '' } },
  );
  if (updated.modifiedCount === 0) {
    // Someone else settled it concurrently; reverse our movement.
    if (txn.direction === 'debit') await credit(userId, txn.amountPaise);
    else await debit(userId, txn.amountPaise);
  }
  return getTransaction(userId, String(txn._id));
}

export const TRANSACTION_TYPE_VALUES = TRANSACTION_TYPES;
export const TRANSACTION_STATUS_VALUES = TRANSACTION_STATUSES;

import { Transaction, User, type TransactionDoc } from '../../models';
import type { PaymentMethod, TransactionDirection, TransactionType } from '../../models/constants';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { generateTransactionId } from '../../utils/ids';
import { MIN_AMOUNT_PAISE, formatINR } from '../../utils/money';
import { credit, debit, hasSufficientBalance } from '../wallet.service';
import { getPaymentGateway } from './index';
import { logger } from '../../utils/logger';
import type { Counterparty } from './recipientResolver';

export interface PaymentIntent {
  userId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amountPaise: number;
  counterparty: Counterparty;
  note?: string;
  paymentMethod: PaymentMethod;
  meta?: Record<string, unknown>;
  /** Client generated; repeating the same key returns the original transaction instead of paying twice. */
  idempotencyKey?: string;
}

/**
 * The one place where a payment is executed. Every feature (send money,
 * recharge, bill payment, add money) builds a PaymentIntent and calls this, so
 * limits, idempotency, gateway interaction and wallet movement are consistent.
 */
export async function processPayment(intent: PaymentIntent): Promise<TransactionDoc> {
  const { userId, direction, amountPaise } = intent;

  // 1) Idempotency: a retry of the same request returns the original result.
  if (intent.idempotencyKey) {
    const existing = await Transaction.findOne({ user: userId, idempotencyKey: intent.idempotencyKey });
    if (existing) {
      if (existing.status === 'success' && intent.type === 'sent') await settleDemoPeerTransfer(userId, existing);
      return existing;
    }
  }

  // 2) Limits.
  if (!Number.isInteger(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
    throw ApiError.validation(`Minimum amount is ${formatINR(MIN_AMOUNT_PAISE)}.`);
  }
  if (amountPaise > env.txnLimitPaise) {
    throw new ApiError(422, 'LIMIT_EXCEEDED', `Per-transaction limit is ${formatINR(env.txnLimitPaise)}.`);
  }

  // 3) Early balance check for a clear error message (the debit below is the real guard).
  if (direction === 'debit' && !(await hasSufficientBalance(userId, amountPaise))) {
    throw new ApiError(402, 'INSUFFICIENT_BALANCE', 'Your SuperPay balance is too low. Add money and try again.');
  }

  // 4) Ask the (mock) gateway.
  const gateway = getPaymentGateway();
  const result = await gateway.authorize({
    type: intent.type,
    amountPaise,
    counterparty: intent.counterparty,
    idempotencyKey: intent.idempotencyKey,
  });

  const base = {
    user: userId,
    txnId: generateTransactionId(),
    type: intent.type,
    direction,
    amountPaise,
    counterparty: intent.counterparty,
    note: intent.note?.trim() || undefined,
    paymentMethod: intent.paymentMethod,
    referenceNo: result.referenceNo,
    meta: { ...(intent.meta ?? {}), gateway: gateway.name, simulated: true },
    idempotencyKey: intent.idempotencyKey,
    createdAt: new Date(),
  };

  if (result.outcome === 'failed') {
    return createOrReturnExisting(userId, intent.idempotencyKey, {
      ...base,
      status: 'failed',
      failureReason: result.reason ?? 'Payment failed.',
      settled: false,
      completedAt: new Date(),
    });
  }

  if (result.outcome === 'pending') {
    const txn = await createOrReturnExisting(userId, intent.idempotencyKey, {
      ...base,
      status: 'pending',
      failureReason: result.reason,
      settled: false,
    });
    scheduleDemoPendingSettlement(userId, String(txn._id));
    return txn;
  }

  // 5) Success: move the money atomically, then record the transaction.
  const moved = direction === 'debit' ? await debit(userId, amountPaise) : await credit(userId, amountPaise);
  if (moved === null) {
    throw new ApiError(402, 'INSUFFICIENT_BALANCE', 'Your SuperPay balance is too low. Add money and try again.');
  }

  try {
    const txn = await Transaction.create({ ...base, status: 'success', settled: true, completedAt: new Date() });
    if (intent.type === 'sent') await settleDemoPeerTransfer(userId, txn);
    return txn;
  } catch (error) {
    // Could not record it: undo the money movement so the ledger stays correct.
    if (direction === 'debit') await credit(userId, amountPaise);
    else await debit(userId, amountPaise);

    const existing = await returnIfDuplicate(error, userId, intent.idempotencyKey);
    if (existing) return existing;
    throw error;
  }
}

async function createOrReturnExisting(
  userId: string,
  idempotencyKey: string | undefined,
  data: Record<string, unknown>,
): Promise<TransactionDoc> {
  try {
    return await Transaction.create(data);
  } catch (error) {
    const existing = await returnIfDuplicate(error, userId, idempotencyKey);
    if (existing) return existing;
    throw error;
  }
}

/** Duplicate idempotency key from a concurrent identical request -> hand back the winner. */
async function returnIfDuplicate(error: unknown, userId: string, key?: string): Promise<TransactionDoc | null> {
  if (key && isDuplicateKeyError(error)) {
    return Transaction.findOne({ user: userId, idempotencyKey: key });
  }
  return null;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}


function scheduleDemoPendingSettlement(userId: string, transactionId: string): void {
  if (getPaymentGateway().name !== 'mock') return;

  setTimeout(() => {
    void (async () => {
      try {
        const { refreshPendingTransaction } = await import('../transaction.service.js');
        const { getWallet } = await import('../wallet.service.js');
        const { serializeTransaction } = await import('../transaction.service.js');
        const { publishTransactionUpdate } = await import('../notification.service.js');
        const txn = await refreshPendingTransaction(userId, transactionId);
        const wallet = await getWallet(userId);
        await publishTransactionUpdate(userId, serializeTransaction(txn), wallet);
      } catch {
        // The next status request can still reconcile a pending demo transaction.
      }
    })();
  }, 10_500).unref();
}


async function settleDemoPeerTransfer(senderUserId: string, senderTxn: TransactionDoc): Promise<void> {
  const mobile = senderTxn.counterparty.mobile;
  const upiId = senderTxn.counterparty.upiId;
  if (!mobile && !upiId) return;

  const recipientFilter: Record<string, unknown>[] = [];
  if (mobile) recipientFilter.push({ mobile });
  if (upiId) recipientFilter.push({ upiId });
  if (recipientFilter.length === 0) return;

  const recipient = await User.findOne({
    _id: { $ne: senderUserId },
    $or: recipientFilter,
  });
  if (!recipient) return;

  const peerKey = `peer:${senderTxn.txnId}`;
  const existing = await Transaction.findOne({ user: recipient._id, idempotencyKey: peerKey });
  if (existing) return;

  await credit(recipient._id, senderTxn.amountPaise);
  try {
    const received = await Transaction.create({
      user: recipient._id,
      txnId: generateTransactionId(),
      type: 'received',
      direction: 'credit',
      amountPaise: senderTxn.amountPaise,
      counterparty: {
        name: 'SuperPay user',
        mobile: senderTxn.counterparty.mobile,
        upiId: senderTxn.counterparty.upiId,
      },
      note: senderTxn.note,
      paymentMethod: 'wallet',
      referenceNo: senderTxn.referenceNo,
      meta: { simulated: true, gateway: 'mock', transferFromUserId: senderUserId, senderTransactionId: senderTxn.txnId },
      idempotencyKey: peerKey,
      settled: true,
      createdAt: new Date(),
      completedAt: new Date(),
    });

    const { getWallet } = await import('../wallet.service.js');
    const { serializeTransaction } = await import('../transaction.service.js');
    const { publishTransactionUpdate } = await import('../notification.service.js');
    await publishTransactionUpdate(String(recipient._id), serializeTransaction(received), await getWallet(recipient._id));
  } catch (error) {
    await debit(recipient._id, senderTxn.amountPaise).catch(() => undefined);
    logger.error('Could not record demo recipient transaction', error);
  }
}

import { Transaction, type TransactionDoc } from '../../models';
import type { PaymentMethod, TransactionDirection, TransactionType } from '../../models/constants';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { generateTransactionId } from '../../utils/ids';
import { MIN_AMOUNT_PAISE, formatINR } from '../../utils/money';
import { credit, debit, hasSufficientBalance } from '../wallet.service';
import { getPaymentGateway } from './index';
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
    if (existing) return existing;
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
    return createOrReturnExisting(userId, intent.idempotencyKey, {
      ...base,
      status: 'pending',
      failureReason: result.reason,
      settled: false,
    });
  }

  // 5) Success: move the money atomically, then record the transaction.
  const moved = direction === 'debit' ? await debit(userId, amountPaise) : await credit(userId, amountPaise);
  if (moved === null) {
    throw new ApiError(402, 'INSUFFICIENT_BALANCE', 'Your SuperPay balance is too low. Add money and try again.');
  }

  try {
    return await Transaction.create({ ...base, status: 'success', settled: true, completedAt: new Date() });
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

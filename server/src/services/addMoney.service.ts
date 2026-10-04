import { FUNDING_SOURCES } from '../config/catalog';
import { ApiError } from '../utils/ApiError';
import { processPayment } from './payment/payment.service';

export function listFundingSources() {
  return FUNDING_SOURCES;
}

export async function addMoney(input: {
  userId: string;
  sourceId: string;
  amountPaise: number;
  idempotencyKey?: string;
}) {
  const source = FUNDING_SOURCES.find((s) => s.id === input.sourceId);
  if (!source) throw ApiError.validation('Choose a funding source.');

  return processPayment({
    userId: input.userId,
    type: 'add_money',
    direction: 'credit',
    amountPaise: input.amountPaise,
    counterparty: { name: `${source.name} ${source.masked}` },
    paymentMethod: 'bank_account',
    note: 'Added to SuperPay balance',
    meta: { sourceId: source.id },
    idempotencyKey: input.idempotencyKey,
  });
}

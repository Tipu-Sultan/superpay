import { RechargePlan } from '../models';
import { CIRCLES, OPERATORS } from '../config/catalog';
import { ApiError } from '../utils/ApiError';
import { isValidMobile, normalizeMobile } from '../utils/validation';
import { processPayment } from './payment/payment.service';

export function getRechargeOptions() {
  return { operators: OPERATORS, circles: CIRCLES };
}

export function serializePlan(p: {
  planId: string; operatorId: string; pricePaise: number; data: string; validityDays: number;
  calls?: string | null; sms?: string | null; description?: string | null; category?: string | null; tag?: string | null;
}) {
  return {
    id: p.planId,
    operatorId: p.operatorId,
    pricePaise: p.pricePaise,
    data: p.data,
    validityDays: p.validityDays,
    calls: p.calls ?? 'Unlimited calls',
    sms: p.sms ?? '',
    description: p.description ?? '',
    category: p.category ?? 'popular',
    tag: p.tag ?? undefined,
  };
}

export async function listPlans(operatorId: string, category?: string) {
  if (!OPERATORS.some((o) => o.id === operatorId)) throw ApiError.validation('Unknown operator.');
  const filter: Record<string, unknown> = { operatorId };
  if (category) filter.category = category;
  const plans = await RechargePlan.find(filter).sort({ pricePaise: 1 }).lean();
  return plans.map((p) => serializePlan(p));
}

export interface RechargeInput {
  userId: string;
  mobile: string;
  operatorId: string;
  circleId: string;
  planId: string;
  idempotencyKey?: string;
}

export async function payRecharge(input: RechargeInput) {
  const mobile = normalizeMobile(input.mobile);
  if (!isValidMobile(mobile)) throw ApiError.validation('Enter a valid 10 digit mobile number.');

  const operator = OPERATORS.find((o) => o.id === input.operatorId);
  if (!operator) throw ApiError.validation('Choose a valid operator.');
  const circle = CIRCLES.find((c) => c.id === input.circleId);
  if (!circle) throw ApiError.validation('Choose a valid circle.');

  const plan = await RechargePlan.findOne({ planId: input.planId, operatorId: operator.id }).lean();
  if (!plan) throw ApiError.validation('That plan is not available for this operator.');

  return processPayment({
    userId: input.userId,
    type: 'recharge',
    direction: 'debit',
    amountPaise: plan.pricePaise,
    counterparty: { name: `${operator.name} Prepaid`, mobile },
    paymentMethod: 'wallet',
    note: `${plan.data} \u00B7 ${plan.validityDays} days`,
    meta: {
      operatorId: operator.id,
      operatorName: operator.name,
      circleId: circle.id,
      circleName: circle.name,
      planId: plan.planId,
      planData: plan.data,
      planValidityDays: plan.validityDays,
      rechargeMobile: mobile,
    },
    idempotencyKey: input.idempotencyKey,
  });
}

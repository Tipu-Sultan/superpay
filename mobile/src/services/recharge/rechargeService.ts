import { api } from '@/services/api/client';
import type { PaymentResponse, PlanCategory, RechargeOptions, RechargePlan } from '@/types/api';

export const rechargeService = {
  getOptions: () => api.get<RechargeOptions>('/recharge/options'),

  getPlans: (operatorId: string, category?: PlanCategory, signal?: AbortSignal) =>
    api.get<RechargePlan[]>('/recharge/plans', { operatorId, category }, signal),

  pay: (input: { mobile: string; operatorId: string; circleId: string; planId: string; idempotencyKey: string }) =>
    api.post<PaymentResponse>('/recharge/pay', input),
};

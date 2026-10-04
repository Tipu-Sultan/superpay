import { api } from '@/services/api/client';
import type { PaymentResponse, Wallet } from '@/types/api';

export const walletService = {
  getWallet: () => api.get<Wallet>('/wallet'),

  /** Simulated top-up from a mock funding source. */
  addMoney: (input: { sourceId: string; amountPaise: number; idempotencyKey: string }) =>
    api.post<PaymentResponse>('/payments/add-money', input),
};

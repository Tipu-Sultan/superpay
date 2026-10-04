import { api } from '@/services/api/client';
import type { BillCategory, BillCategoryId, Biller, FetchedBill, PaymentResponse } from '@/types/api';

export const billService = {
  getCategories: () => api.get<BillCategory[]>('/bills/categories'),

  getBillers: (category: BillCategoryId, signal?: AbortSignal) => api.get<Biller[]>('/bills/billers', { category }, signal),

  /** Looks up the pending bill for a customer account (simulated). */
  fetchBill: (input: { billerId: string; accountNumber: string }) => api.post<FetchedBill>('/bills/fetch', input),

  /** The server recomputes the amount; the client never decides what is owed. */
  pay: (input: { billerId: string; accountNumber: string; idempotencyKey: string }) =>
    api.post<PaymentResponse>('/bills/pay', input),
};

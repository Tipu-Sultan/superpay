import { api } from '@/services/api/client';
import type { PaymentResponse, Transaction, TransactionFilters, TransactionPage } from '@/types/api';

export const transactionService = {
  list: (params: TransactionFilters & { cursor?: string; limit?: number }, signal?: AbortSignal) =>
    api.get<TransactionPage>('/transactions', { ...params }, signal),

  get: (id: string, signal?: AbortSignal) => api.get<Transaction>(`/transactions/${encodeURIComponent(id)}`, undefined, signal),

  /** Asks the gateway again about a pending payment. */
  refresh: (id: string) => api.post<PaymentResponse>(`/transactions/${encodeURIComponent(id)}/refresh`),
};

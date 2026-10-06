import type { BillCategoryId, PlanCategory, TransactionFilters } from '@/types/api';

/** Central registry so invalidation after a payment can never miss a key. */
export const queryKeys = {
  wallet: ['wallet'] as const,
  paymentConfig: ['payment-config'] as const,
  contacts: (q: string) => ['contacts', q] as const,
  transactions: ['transactions'] as const,
  transactionList: (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
  transactionRecent: (limit: number) => ['transactions', 'recent', limit] as const,
  transaction: (id: string) => ['transactions', 'detail', id] as const,
  rechargeOptions: ['recharge', 'options'] as const,
  rechargePlans: (operatorId: string, category?: PlanCategory) => ['recharge', 'plans', operatorId, category ?? 'all'] as const,
  billCategories: ['bills', 'categories'] as const,
  billers: (category: BillCategoryId) => ['bills', 'billers', category] as const,
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  announcements: ['announcements'] as const,
};

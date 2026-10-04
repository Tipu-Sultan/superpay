export const TRANSACTION_TYPES = ['sent', 'received', 'recharge', 'bill_payment', 'add_money'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ['success', 'pending', 'failed'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const TRANSACTION_DIRECTIONS = ['debit', 'credit'] as const;
export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];

export const PAYMENT_METHODS = ['wallet', 'bank_account'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const BILL_CATEGORIES = [
  'electricity',
  'mobile_postpaid',
  'dth',
  'water',
  'gas',
  'broadband',
  'insurance',
] as const;
export type BillCategory = (typeof BILL_CATEGORIES)[number];

/** Avatar palette for contacts and users (all pass contrast with white text). */
export const AVATAR_COLORS = ['#0F766E', '#B45309', '#9D174D', '#1D4ED8', '#6D28D9', '#15803D', '#C2410C', '#0E7490'];

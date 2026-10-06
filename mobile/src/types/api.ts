/** Mirrors the SuperPay API (server/src/types/dto.ts). */

export type TransactionType = 'sent' | 'received' | 'recharge' | 'bill_payment' | 'add_money';
export type TransactionStatus = 'success' | 'pending' | 'failed';
export type TransactionDirection = 'debit' | 'credit';
export type PaymentMethod = 'wallet' | 'bank_account';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  upiId: string;
  avatarColor: string;
  createdAt: string;
}

export interface Wallet {
  balancePaise: number;
  currency: 'INR';
}

export interface Contact {
  id: string;
  name: string;
  mobile: string;
  upiId: string;
  avatarColor: string;
  isFavorite: boolean;
}

export interface Counterparty {
  name: string;
  mobile?: string;
  upiId?: string;
  contactId?: string;
}

export interface Transaction {
  id: string;
  txnId: string;
  type: TransactionType;
  direction: TransactionDirection;
  status: TransactionStatus;
  amountPaise: number;
  counterparty: Counterparty;
  note?: string;
  paymentMethod: PaymentMethod;
  referenceNo: string;
  meta?: Record<string, unknown>;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionPage {
  items: Transaction[];
  nextCursor: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  q?: string;
}

export interface PaymentResponse {
  transaction: Transaction;
  wallet: Wallet;
}

export interface FundingSource {
  id: string;
  name: string;
  masked: string;
  kind: 'bank_account';
}

export interface PaymentConfig {
  minAmountPaise: number;
  maxAmountPaise: number;
  simulated: boolean;
  fundingSources: FundingSource[];
}

export interface SessionResponse {
  token: string;
  user: User;
  wallet: Wallet;
  isNew: boolean;
}

export interface Operator {
  id: string;
  name: string;
  color: string;
}
export interface Circle {
  id: string;
  name: string;
}
export interface RechargeOptions {
  operators: Operator[];
  circles: Circle[];
}
export type PlanCategory = 'popular' | 'data' | 'unlimited' | 'topup';
export interface RechargePlan {
  id: string;
  operatorId: string;
  pricePaise: number;
  data: string;
  validityDays: number;
  calls: string;
  sms: string;
  description: string;
  category: PlanCategory;
  tag?: string;
}

export type BillCategoryId =
  | 'electricity'
  | 'mobile_postpaid'
  | 'dth'
  | 'water'
  | 'gas'
  | 'broadband'
  | 'insurance';

export interface BillCategory {
  id: BillCategoryId;
  label: string;
  icon: string;
  description: string;
}
export interface Biller {
  id: string;
  category: BillCategoryId;
  name: string;
  accountLabel: string;
  accountHint: string;
  minLength: number;
  maxLength: number;
}
export interface FetchedBill {
  billerId: string;
  billerName: string;
  category: BillCategoryId;
  accountNumber: string;
  customerName: string;
  billNumber: string;
  amountPaise: number;
  billDate: string;
  dueDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  tone: 'brand' | 'accent' | 'info';
}


export interface Notification {
  id: string;
  type: 'transaction' | 'system' | 'security';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface UnreadNotificationCount {
  count: number;
}

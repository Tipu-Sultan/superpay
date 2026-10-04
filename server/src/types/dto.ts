import type { TransactionDirection, TransactionStatus, TransactionType, PaymentMethod } from '../models/constants';

/** Shapes returned by the API. Mirrored in mobile/src/types. */
export interface TransactionDTO {
  id: string;
  txnId: string;
  type: TransactionType;
  direction: TransactionDirection;
  status: TransactionStatus;
  amountPaise: number;
  counterparty: { name: string; mobile?: string; upiId?: string; contactId?: string };
  note?: string;
  paymentMethod: PaymentMethod;
  referenceNo: string;
  meta?: Record<string, unknown>;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UserDTO {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  upiId: string;
  avatarColor: string;
  createdAt: string;
}

export interface ContactDTO {
  id: string;
  name: string;
  mobile: string;
  upiId: string;
  avatarColor: string;
  isFavorite: boolean;
}

export interface WalletDTO {
  balancePaise: number;
  currency: 'INR';
}

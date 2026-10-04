import type { Contact, BillCategoryId } from './api';

/** Who the user is paying, normalised from contacts / typed input / scanned QR. */
export type RecipientSelection =
  | { kind: 'contact'; contact: Contact }
  | { kind: 'mobile'; mobile: string; name?: string }
  | { kind: 'upi'; upiId: string; name?: string; source?: 'typed' | 'qr' };

export interface SummaryRow {
  label: string;
  value: string;
}

/** What the generic confirmation screen needs to render, regardless of payment kind. */
export interface DraftSummary {
  /** e.g. "Paying Rahul Sharma" */
  headline: string;
  /** e.g. "9000000101" or "Jio Prepaid" */
  subline?: string;
  /** Avatar seed: a name and a colour hint. */
  avatarName: string;
  avatarColor?: string;
  rows: SummaryRow[];
}

interface DraftBase {
  amountPaise: number;
  summary: DraftSummary;
  /** Generated when the draft is created, reused if the same confirmation is retried. */
  idempotencyKey: string;
}

export interface SendDraft extends DraftBase {
  kind: 'send';
  recipient: RecipientSelection;
  note: string;
}

export interface RechargeDraft extends DraftBase {
  kind: 'recharge';
  mobile: string;
  operatorId: string;
  circleId: string;
  planId: string;
}

export interface BillDraft extends DraftBase {
  kind: 'bill';
  category: BillCategoryId;
  billerId: string;
  accountNumber: string;
}

export interface AddMoneyDraft extends DraftBase {
  kind: 'add_money';
  sourceId: string;
}

export type PaymentDraft = SendDraft | RechargeDraft | BillDraft | AddMoneyDraft;
export type PaymentKind = PaymentDraft['kind'];

/** Values captured on the way to the amount screen (before a full draft exists). */
export interface PendingTransfer {
  recipient: RecipientSelection;
  /** Pre-filled when a QR code carries an amount. */
  prefillAmountPaise?: number;
  prefillNote?: string;
}

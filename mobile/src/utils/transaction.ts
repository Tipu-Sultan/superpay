import type { Transaction, TransactionStatus, TransactionType } from '@/types/api';
import type { IconName } from '@/components/ui/Icon';

export const TYPE_LABEL: Record<TransactionType, string> = {
  sent: 'Sent',
  received: 'Received',
  recharge: 'Recharge',
  bill_payment: 'Bill payment',
  add_money: 'Add money',
};

export const TYPE_ICON: Record<TransactionType, IconName> = {
  sent: 'arrow-up-outline',
  received: 'arrow-down-outline',
  recharge: 'phone-portrait-outline',
  bill_payment: 'receipt-outline',
  add_money: 'wallet-outline',
};

export const STATUS_LABEL: Record<TransactionStatus, string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
};

/** Row title, e.g. "Rahul Sharma", "Jio Prepaid", "Metro Electricity Board". */
export function transactionTitle(txn: Transaction): string {
  if (txn.type === 'add_money') return 'Added to SuperPay';
  return txn.counterparty.name;
}

/** Row subtitle, e.g. "Paid · Dinner split". */
export function transactionSubtitle(txn: Transaction): string {
  const verb =
    txn.type === 'sent' ? 'Paid'
    : txn.type === 'received' ? 'Received'
    : txn.type === 'recharge' ? 'Recharge'
    : txn.type === 'bill_payment' ? 'Bill paid'
    : 'Bank to SuperPay';
  const status = txn.status === 'success' ? verb : txn.status === 'pending' ? `${verb} \u00B7 Pending` : `${verb} \u00B7 Failed`;
  return txn.note && txn.type !== 'add_money' ? `${status} \u00B7 ${txn.note}` : status;
}

/** "Paid to" / "Received from" / "Operator" ... label for the detail screen. */
export function counterpartyLabel(txn: Transaction): string {
  switch (txn.type) {
    case 'sent': return 'Paid to';
    case 'received': return 'Received from';
    case 'recharge': return 'Recharged';
    case 'bill_payment': return 'Biller';
    case 'add_money': return 'Funding source';
  }
}

export const isCredit = (txn: Transaction) => txn.direction === 'credit';

/** Words for the filter chips. */
export const TYPE_FILTERS: { value: TransactionType | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
  { value: 'recharge', label: 'Recharge' },
  { value: 'bill_payment', label: 'Bills' },
  { value: 'add_money', label: 'Add money' },
];

export const STATUS_FILTERS: { value: TransactionStatus | undefined; label: string }[] = [
  { value: undefined, label: 'Any status' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

/** Extra labelled rows shown on the detail screen, derived from `meta`. */
export function metaRows(txn: Transaction): { label: string; value: string }[] {
  const meta = txn.meta ?? {};
  const str = (key: string) => (typeof meta[key] === 'string' ? (meta[key] as string) : undefined);
  const num = (key: string) => (typeof meta[key] === 'number' ? (meta[key] as number) : undefined);
  const rows: { label: string; value: string }[] = [];

  if (txn.type === 'recharge') {
    const mobile = str('rechargeMobile');
    if (mobile) rows.push({ label: 'Mobile number', value: mobile });
    const operator = str('operatorName');
    if (operator) rows.push({ label: 'Operator', value: operator });
    const circle = str('circleName');
    if (circle) rows.push({ label: 'Circle', value: circle });
    const data = str('planData');
    const days = num('planValidityDays');
    if (data) rows.push({ label: 'Plan', value: days ? `${data} \u00B7 ${days} days` : data });
  }
  if (txn.type === 'bill_payment') {
    const account = str('accountNumber');
    if (account) rows.push({ label: 'Account number', value: account });
    const customer = str('customerName');
    if (customer) rows.push({ label: 'Customer name', value: customer });
    const billNo = str('billNumber');
    if (billNo) rows.push({ label: 'Bill number', value: billNo });
  }
  if (txn.counterparty.upiId && (txn.type === 'sent' || txn.type === 'received')) {
    rows.push({ label: 'UPI ID', value: txn.counterparty.upiId });
  }
  if (txn.counterparty.mobile && (txn.type === 'sent' || txn.type === 'received')) {
    rows.push({ label: 'Mobile number', value: txn.counterparty.mobile });
  }
  return rows;
}

export function paymentMethodLabel(txn: Transaction): string {
  if (txn.paymentMethod === 'bank_account') return 'Bank account (simulated)';
  return 'SuperPay balance';
}

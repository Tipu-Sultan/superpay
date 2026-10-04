import { Biller, BILL_CATEGORIES, type BillCategory } from '../models';
import { BILL_CATEGORY_META } from '../config/catalog';
import { ApiError } from '../utils/ApiError';
import { fnv1a } from '../utils/hash';
import { processPayment } from './payment/payment.service';

export function listBillCategories() {
  return BILL_CATEGORY_META;
}

export function assertCategory(value: string): BillCategory {
  if (!(BILL_CATEGORIES as readonly string[]).includes(value)) throw ApiError.validation('Unknown bill category.');
  return value as BillCategory;
}

export function serializeBiller(b: {
  billerId: string; category: string; name: string; accountLabel: string;
  accountHint?: string | null; minLength?: number | null; maxLength?: number | null;
}) {
  return {
    id: b.billerId,
    category: b.category as BillCategory,
    name: b.name,
    accountLabel: b.accountLabel,
    accountHint: b.accountHint ?? '',
    minLength: b.minLength ?? 6,
    maxLength: b.maxLength ?? 20,
  };
}

export async function listBillers(category: BillCategory) {
  const billers = await Biller.find({ category, isActive: true }).sort({ name: 1 }).lean();
  return billers.map((b) => serializeBiller(b));
}

async function getBillerOrThrow(billerId: string) {
  const biller = await Biller.findOne({ billerId, isActive: true }).lean();
  if (!biller) throw ApiError.notFound('Biller not found.');
  return biller;
}

function assertAccountNumber(
  biller: { accountLabel: string; minLength?: number | null; maxLength?: number | null },
  accountNumber: string,
) {
  const min = biller.minLength ?? 6;
  const max = biller.maxLength ?? 20;
  if (!/^[A-Za-z0-9-]+$/.test(accountNumber) || accountNumber.length < min || accountNumber.length > max) {
    throw ApiError.validation(`${biller.accountLabel} must be ${min === max ? min : `${min}-${max}`} characters (letters and digits).`);
  }
}

const CUSTOMER_NAMES = [
  'Rakesh Kumar', 'Sunita Devi', 'Mahesh Patil', 'Farah Khan', 'Gurpreet Kaur',
  'Suresh Menon', 'Deepa Joshi', 'Imran Qureshi', 'Pooja Bansal', 'Naveen Rao',
];

export interface FetchedBill {
  billerId: string;
  billerName: string;
  category: BillCategory;
  accountNumber: string;
  customerName: string;
  billNumber: string;
  amountPaise: number;
  billDate: string;
  dueDate: string;
}

/**
 * Simulated bill fetch. Values are derived deterministically from the biller and
 * account number so the same input always returns the same bill. A real
 * integration would call BBPS / the biller here.
 * An account number ending in "000" simulates "no pending bill".
 */
export async function fetchBill(billerId: string, accountNumber: string): Promise<FetchedBill> {
  const biller = await getBillerOrThrow(billerId);
  const account = accountNumber.trim().toUpperCase();
  assertAccountNumber(biller, account);

  if (account.endsWith('000')) {
    throw new ApiError(404, 'NOT_FOUND', 'No pending bill was found for this account.');
  }

  const seed = fnv1a(`${billerId}:${account}`);
  const category = biller.category as BillCategory;
  const [low, high] =
    category === 'insurance' ? [150000, 1800000]
    : category === 'electricity' ? [45000, 420000]
    : category === 'broadband' ? [39900, 129900]
    : category === 'dth' ? [24900, 69900]
    : category === 'mobile_postpaid' ? [29900, 99900]
    : [18000, 150000];
  // Round to whole rupees for nicer demo amounts.
  const amountPaise = Math.round((low + (seed % (high - low))) / 100) * 100;

  const bill = new Date();
  bill.setDate(bill.getDate() - ((seed >> 3) % 9) - 1);
  const due = new Date();
  due.setDate(due.getDate() + ((seed >> 5) % 12) + 3);

  return {
    billerId,
    billerName: biller.name,
    category,
    accountNumber: account,
    customerName: CUSTOMER_NAMES[seed % CUSTOMER_NAMES.length]!,
    billNumber: `BL${(seed % 90000000) + 10000000}`,
    amountPaise,
    billDate: bill.toISOString(),
    dueDate: due.toISOString(),
  };
}

export interface PayBillInput {
  userId: string;
  billerId: string;
  accountNumber: string;
  idempotencyKey?: string;
}

/** The amount is re-derived on the server, never trusted from the client. */
export async function payBill(input: PayBillInput) {
  const bill = await fetchBill(input.billerId, input.accountNumber);
  return processPayment({
    userId: input.userId,
    type: 'bill_payment',
    direction: 'debit',
    amountPaise: bill.amountPaise,
    counterparty: { name: bill.billerName },
    paymentMethod: 'wallet',
    note: `${bill.accountNumber}`,
    meta: {
      category: bill.category,
      billerId: bill.billerId,
      billerName: bill.billerName,
      accountNumber: bill.accountNumber,
      customerName: bill.customerName,
      billNumber: bill.billNumber,
      dueDate: bill.dueDate,
    },
    idempotencyKey: input.idempotencyKey,
  });
}

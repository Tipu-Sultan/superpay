import { Contact, Transaction, type UserDoc } from '../models';
import { AVATAR_COLORS } from '../models/constants';
import { generateReferenceNo, generateTransactionId } from '../utils/ids';
import { upiIdForMobile } from '../utils/validation';
import { resetWallet } from '../services/wallet.service';
import { env } from '../config/env';

/**
 * Mock people. Numbers follow an obvious pattern so they are clearly not real.
 */
const CONTACTS = [
  { name: 'Rahul Sharma', mobile: '9000000101', isFavorite: true },
  { name: 'Priya Nair', mobile: '9000000102', isFavorite: true },
  { name: 'Amit Verma', mobile: '9000000103', isFavorite: true },
  { name: 'Sneha Iyer', mobile: '9000000104', isFavorite: true },
  { name: 'Karan Malhotra', mobile: '9000000105', isFavorite: false },
  { name: 'Ananya Das', mobile: '9000000106', isFavorite: false },
  { name: 'Mohammed Faisal', mobile: '9000000107', isFavorite: false },
  { name: 'Lakshmi Reddy', mobile: '9000000108', isFavorite: false },
  { name: 'Vikram Singh', mobile: '9000000109', isFavorite: false },
  { name: 'Neha Kulkarni', mobile: '9000000110', isFavorite: false },
];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Creates (or recreates) contacts, a starter balance and a realistic history for a user. */
export async function seedDemoData(user: UserDoc): Promise<void> {
  await Promise.all([Contact.deleteMany({ owner: user._id }), Transaction.deleteMany({ user: user._id })]);

  const contacts = await Contact.insertMany(
    CONTACTS.map((c, i) => ({
      owner: user._id,
      name: c.name,
      mobile: c.mobile,
      upiId: upiIdForMobile(c.mobile),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length]!,
      isFavorite: c.isFavorite,
    })),
  );
  const byName = (name: string) => contacts.find((c) => c.name === name)!;
  const person = (name: string) => {
    const c = byName(name);
    return { name: c.name, mobile: c.mobile, upiId: c.upiId, contactId: c._id };
  };

  const now = Date.now();
  const ago = (ms: number) => new Date(now - ms);

  type Seed = {
    type: 'sent' | 'received' | 'recharge' | 'bill_payment' | 'add_money';
    status: 'success' | 'pending' | 'failed';
    rupees: number;
    when: number;
    counterparty: { name: string; mobile?: string; upiId?: string; contactId?: unknown };
    note?: string;
    meta?: Record<string, unknown>;
    failureReason?: string;
  };

  const seeds: Seed[] = [
    { type: 'sent', status: 'success', rupees: 500, when: 2 * HOUR, counterparty: person('Rahul Sharma'), note: 'Dinner split' },
    { type: 'received', status: 'success', rupees: 1200, when: 5 * HOUR, counterparty: person('Priya Nair'), note: 'Rent share' },
    { type: 'recharge', status: 'success', rupees: 299, when: 1 * DAY + 2 * HOUR, counterparty: { name: 'Jio Prepaid', mobile: user.mobile }, note: '2 GB/day \u00B7 28 days',
      meta: { operatorName: 'Jio', circleName: 'Delhi NCR', planData: '2 GB/day', planValidityDays: 28, rechargeMobile: user.mobile } },
    { type: 'bill_payment', status: 'success', rupees: 1840, when: 1 * DAY + 6 * HOUR, counterparty: { name: 'Metro Electricity Board' }, note: '4829017356',
      meta: { category: 'electricity', billerName: 'Metro Electricity Board', accountNumber: '4829017356', customerName: user.name } },
    { type: 'add_money', status: 'success', rupees: 5000, when: 2 * DAY + 3 * HOUR, counterparty: { name: 'Demo Savings Account \u2022\u2022\u2022\u2022 4321' }, note: 'Added to SuperPay balance' },
    { type: 'sent', status: 'pending', rupees: 250, when: 3 * DAY, counterparty: person('Amit Verma'), note: 'Cab fare' },
    { type: 'sent', status: 'failed', rupees: 1800, when: 3 * DAY + 4 * HOUR, counterparty: person('Sneha Iyer'), note: 'Concert tickets', failureReason: 'Declined by the simulated bank. No money was moved.' },
    { type: 'received', status: 'success', rupees: 750, when: 4 * DAY, counterparty: person('Karan Malhotra'), note: 'Movie night' },
    { type: 'bill_payment', status: 'success', rupees: 499, when: 5 * DAY, counterparty: { name: 'SkyView DTH' }, note: '4403219876',
      meta: { category: 'dth', billerName: 'SkyView DTH', accountNumber: '4403219876', customerName: user.name } },
    { type: 'bill_payment', status: 'success', rupees: 320, when: 8 * DAY, counterparty: { name: 'City Water Board' }, note: 'WB20048317',
      meta: { category: 'water', billerName: 'City Water Board', accountNumber: 'WB20048317', customerName: user.name } },
    { type: 'sent', status: 'success', rupees: 100, when: 9 * DAY, counterparty: person('Neha Kulkarni'), note: 'Chai and snacks' },
    { type: 'add_money', status: 'success', rupees: 2000, when: 12 * DAY, counterparty: { name: 'Demo Savings Account \u2022\u2022\u2022\u2022 4321' }, note: 'Added to SuperPay balance' },
    { type: 'bill_payment', status: 'failed', rupees: 980, when: 15 * DAY, counterparty: { name: 'City Gas Distribution' }, note: '7712098834',
      meta: { category: 'gas', billerName: 'City Gas Distribution', accountNumber: '7712098834', customerName: user.name }, failureReason: 'Biller did not respond. No money was moved.' },
    { type: 'received', status: 'success', rupees: 3000, when: 20 * DAY, counterparty: person('Ananya Das'), note: 'Trip advance' },
    { type: 'sent', status: 'success', rupees: 640, when: 24 * DAY, counterparty: person('Mohammed Faisal'), note: 'Groceries' },
  ];

  await Transaction.insertMany(
    seeds.map((s) => {
      const createdAt = ago(s.when);
      return {
        user: user._id,
        txnId: generateTransactionId(),
        type: s.type,
        direction: s.type === 'received' || s.type === 'add_money' ? 'credit' : 'debit',
        status: s.status,
        amountPaise: s.rupees * 100,
        counterparty: s.counterparty,
        note: s.note,
        paymentMethod: s.type === 'add_money' ? 'bank_account' : 'wallet',
        referenceNo: generateReferenceNo(),
        meta: { ...(s.meta ?? {}), simulated: true, gateway: 'mock' },
        failureReason: s.failureReason,
        settled: s.status === 'success',
        createdAt,
        completedAt: s.status === 'pending' ? undefined : createdAt,
      };
    }),
  );

  await resetWallet(user._id, env.starterBalancePaise);
}

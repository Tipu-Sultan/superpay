import { z } from 'zod';
import { BILL_CATEGORIES, TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../models/constants';

const idempotencyKey = z.string().min(8).max(80).regex(/^[A-Za-z0-9_-]+$/).optional();
const amountPaise = z.number().int('Amount must be a whole number of paise').positive('Enter an amount greater than zero');
const note = z.string().trim().max(140, 'Note can be at most 140 characters').optional();

export const sessionSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(60),
  mobile: z.string().trim().min(10, 'Enter a valid 10 digit mobile number').max(16),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).optional(),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address'), z.null()]).optional(),
  })
  .refine((v) => v.name !== undefined || v.email !== undefined, 'Nothing to update');

export const recipientSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('contact'), contactId: z.string().min(1) }),
  z.object({ kind: z.literal('mobile'), mobile: z.string().min(10).max(16), name: z.string().trim().max(60).optional() }),
  z.object({ kind: z.literal('upi'), upiId: z.string().trim().min(5).max(100), name: z.string().trim().max(60).optional() }),
]);

export const sendMoneySchema = z.object({
  recipient: recipientSchema,
  amountPaise,
  note,
  idempotencyKey,
});

export const addMoneySchema = z.object({
  sourceId: z.string().min(1),
  amountPaise,
  idempotencyKey,
});

export const rechargePaySchema = z.object({
  mobile: z.string().min(10).max(16),
  operatorId: z.string().min(1),
  circleId: z.string().min(1),
  planId: z.string().min(1),
  idempotencyKey,
});

export const plansQuerySchema = z.object({
  operatorId: z.string().min(1),
  category: z.enum(['popular', 'data', 'unlimited', 'topup']).optional(),
});

export const billersQuerySchema = z.object({ category: z.enum(BILL_CATEGORIES) });

export const billFetchSchema = z.object({
  billerId: z.string().min(1),
  accountNumber: z.string().trim().min(4).max(24),
});

export const billPaySchema = billFetchSchema.extend({ idempotencyKey });

export const contactsQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const transactionsQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  q: z.string().trim().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(200).optional(),
});

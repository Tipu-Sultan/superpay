import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';
import {
  PAYMENT_METHODS,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from './constants';

const counterpartySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String },
    upiId: { type: String },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  },
  { _id: false },
);

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    /** Public, human readable id shown in the app (e.g. SP7K2M9XQ4T8LD3B). */
    txnId: { type: String, required: true, unique: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    direction: { type: String, enum: TRANSACTION_DIRECTIONS, required: true },
    status: { type: String, enum: TRANSACTION_STATUSES, required: true },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'amountPaise must be an integer' },
    },
    counterparty: { type: counterpartySchema, required: true },
    note: { type: String, trim: true, maxlength: 140 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    /** Bank style reference number (simulated). */
    referenceNo: { type: String, required: true },
    /** Extra, type specific information: recharge plan, biller, account, etc. */
    meta: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    /** Lets the client safely retry a request without paying twice. */
    idempotencyKey: { type: String },
    /** True once the wallet balance has been moved for this transaction. */
    settled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, status: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1, createdAt: -1 });
transactionSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
transactionSchema.plugin(cleanJsonPlugin);

export type TransactionAttrs = InferSchemaType<typeof transactionSchema>;
export type TransactionDoc = HydratedDocument<TransactionAttrs>;
export const Transaction = model('Transaction', transactionSchema);

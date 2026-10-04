import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';
import { BILL_CATEGORIES } from './constants';

const billerSchema = new Schema(
  {
    billerId: { type: String, required: true, unique: true },
    category: { type: String, enum: BILL_CATEGORIES, required: true, index: true },
    name: { type: String, required: true },
    /** Label for the customer identifier field, e.g. "Consumer number". */
    accountLabel: { type: String, required: true },
    accountHint: { type: String, default: '' },
    minLength: { type: Number, default: 6 },
    maxLength: { type: Number, default: 20 },
    region: { type: String, default: 'India' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

billerSchema.plugin(cleanJsonPlugin);

export type BillerAttrs = InferSchemaType<typeof billerSchema>;
export type BillerDoc = HydratedDocument<BillerAttrs>;
export const Biller = model('Biller', billerSchema);

import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const walletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    /** Integer paise. The `min: 0` validator is a second line of defence behind the atomic debit filter. */
    balancePaise: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: { validator: Number.isInteger, message: 'balancePaise must be an integer' },
    },
    currency: { type: String, default: 'INR', enum: ['INR'] },
  },
  { timestamps: true },
);

walletSchema.plugin(cleanJsonPlugin);

export type WalletAttrs = InferSchemaType<typeof walletSchema>;
export type WalletDoc = HydratedDocument<WalletAttrs>;
export const Wallet = model('Wallet', walletSchema);

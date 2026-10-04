import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const rechargePlanSchema = new Schema(
  {
    planId: { type: String, required: true, unique: true },
    operatorId: { type: String, required: true, index: true },
    pricePaise: { type: Number, required: true, min: 100 },
    data: { type: String, required: true },
    validityDays: { type: Number, required: true },
    calls: { type: String, default: 'Unlimited calls' },
    sms: { type: String, default: '100 SMS/day' },
    description: { type: String, default: '' },
    category: { type: String, enum: ['popular', 'data', 'unlimited', 'topup'], default: 'popular' },
    tag: { type: String },
  },
  { timestamps: true },
);

rechargePlanSchema.index({ operatorId: 1, pricePaise: 1 });
rechargePlanSchema.plugin(cleanJsonPlugin);

export type RechargePlanAttrs = InferSchemaType<typeof rechargePlanSchema>;
export type RechargePlanDoc = HydratedDocument<RechargePlanAttrs>;
export const RechargePlan = model('RechargePlan', rechargePlanSchema);

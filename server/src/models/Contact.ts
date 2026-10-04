import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const contactSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    upiId: { type: String, required: true, lowercase: true },
    avatarColor: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

contactSchema.index({ owner: 1, mobile: 1 }, { unique: true });
contactSchema.index({ owner: 1, name: 1 });
contactSchema.plugin(cleanJsonPlugin);

export type ContactAttrs = InferSchemaType<typeof contactSchema>;
export type ContactDoc = HydratedDocument<ContactAttrs>;
export const Contact = model('Contact', contactSchema);

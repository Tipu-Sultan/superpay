import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    mobile: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    /** UPI-style id for receiving money (demo handle, not a real UPI VPA). */
    upiId: { type: String, required: true, unique: true, lowercase: true },
    avatarColor: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.plugin(cleanJsonPlugin);

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;
export const User = model('User', userSchema);

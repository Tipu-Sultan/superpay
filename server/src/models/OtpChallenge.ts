import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const otpChallengeSchema = new Schema(
  {
    mobile: { type: String, required: true, index: true },
    codeHash: { type: String },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    provider: { type: String, enum: ['twilio', 'demo'], required: true },
    // Removed index: true here so schema.index() can handle the TTL index properly
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date },
  },
  { timestamps: true },
);

// This line defines both the index and the TTL expiration behavior
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpChallengeAttrs = InferSchemaType<typeof otpChallengeSchema>;
export type OtpChallengeDoc = HydratedDocument<OtpChallengeAttrs>;
export const OtpChallenge = model('OtpChallenge', otpChallengeSchema);
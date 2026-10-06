import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['transaction', 'system', 'security'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 240 },
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
notificationSchema.plugin(cleanJsonPlugin);

export type NotificationAttrs = InferSchemaType<typeof notificationSchema>;
export type NotificationDoc = HydratedDocument<NotificationAttrs>;
export const Notification = model('Notification', notificationSchema);

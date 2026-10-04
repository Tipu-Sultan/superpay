import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { cleanJsonPlugin } from './plugins';

const announcementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    ctaLabel: { type: String },
    /** In-app route the call to action opens, e.g. /recharge */
    ctaRoute: { type: String },
    tone: { type: String, enum: ['brand', 'accent', 'info'], default: 'brand' },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

announcementSchema.plugin(cleanJsonPlugin);

export type AnnouncementAttrs = InferSchemaType<typeof announcementSchema>;
export type AnnouncementDoc = HydratedDocument<AnnouncementAttrs>;
export const Announcement = model('Announcement', announcementSchema);

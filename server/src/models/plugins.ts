import type { Schema } from 'mongoose';

/** Converts `_id` to `id`, stringifies ObjectIds and strips `__v` from every JSON response. */
export function cleanJsonPlugin(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: false,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      return ret;
    },
  });
}

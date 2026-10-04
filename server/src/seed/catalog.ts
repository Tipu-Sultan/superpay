import { Announcement, Biller, RechargePlan } from '../models';
import { ANNOUNCEMENTS, BILLERS, buildPlans } from './catalogData';
import { logger } from '../utils/logger';

/** Idempotent upserts so it is safe to run on every boot and from `npm run seed`. */
export async function seedCatalog(): Promise<void> {
  await Biller.bulkWrite(
    BILLERS.map((b) => ({
      updateOne: { filter: { billerId: b.billerId }, update: { $set: { ...b, isActive: true } }, upsert: true },
    })),
  );

  await RechargePlan.bulkWrite(
    buildPlans().map((p) => ({
      updateOne: { filter: { planId: p.planId }, update: { $set: p }, upsert: true },
    })),
  );

  await Announcement.bulkWrite(
    ANNOUNCEMENTS.map((a) => ({
      updateOne: { filter: { key: a.key }, update: { $set: { ...a, isActive: true } }, upsert: true },
    })),
  );

  logger.info('Catalogue seeded (billers, recharge plans, announcements)');
}

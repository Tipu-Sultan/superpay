import { connectDatabase, disconnectDatabase } from '../config/db';
import { seedCatalog } from './catalog';
import { logger } from '../utils/logger';

/** `npm run seed` - seeds billers, recharge plans and announcements. */
async function main() {
  await connectDatabase();
  await seedCatalog();
  await disconnectDatabase();
}

main().catch((error) => {
  logger.error('Seeding failed', error);
  process.exit(1);
});

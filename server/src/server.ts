import { createServer } from 'node:http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { seedCatalog } from './seed/catalog';
import { logger } from './utils/logger';
import { closeRealtime, initRealtime } from './services/realtime.service';

async function main() {
  await connectDatabase();
  await seedCatalog();

  const app = createApp();
  const server = createServer(app);
  await initRealtime(server);
  server.listen(env.port, '0.0.0.0', () => {
    logger.info(`SuperPay API listening on http://0.0.0.0:${env.port}/api  (payments are SIMULATED)`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await closeRealtime();
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', reason));

main().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});

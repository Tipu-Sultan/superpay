import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';
import { router } from './routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins === '*' ? true : env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));
  if (!env.isProduction) app.use(morgan('dev'));

  app.use('/api', apiLimiter, router);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

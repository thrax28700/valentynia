import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/error';
import { authRouter } from './modules/auth/auth.routes';
import { hrRouter } from './modules/hr/hr.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { complianceRouter } from './modules/compliance/compliance.routes';
import { aiRouter } from './modules/ai/ai.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'valentynia-api' }));

  // Architecture modulaire : un routeur par domaine métier.
  app.use('/api/auth', authRouter);
  app.use('/api/hr', hrRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/compliance', complianceRouter);
  app.use('/api/ai', aiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

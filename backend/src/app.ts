import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { notFound, errorHandler } from './middleware/error';
import { authRouter } from './modules/auth/auth.routes';
import { hrRouter } from './modules/hr/hr.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { complianceRouter } from './modules/compliance/compliance.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { companyRouter } from './modules/company/company.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // derrière le proxy de l'hébergeur (Render)
  app.disable('x-powered-by');
  app.use(
    helmet({
      // API JSON : pas de contenu HTML rendu, on garde des règles strictes par défaut.
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  if (env.NODE_ENV === 'production') app.use(morgan('combined'));
  else if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Limitation de débit globale (protection basique contre l'abus).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: () => env.NODE_ENV === 'test',
    }),
  );

  // Anti-brute-force renforcé sur l'authentification (désactivé hors production).
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => env.NODE_ENV !== 'production',
    message: { error: 'Trop de tentatives, réessayez dans quelques minutes.' },
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'valentynia-api' }));

  // Architecture modulaire : un routeur par domaine métier.
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/hr', hrRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/compliance', complianceRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/company', companyRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

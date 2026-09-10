import 'dotenv/config';
import { z } from 'zod';

/** Traite les variables vides comme absentes (utile pour les options laissées vides). */
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  AES_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, 'AES_KEY doit être 64 caractères hexadécimaux'),
  FACTURX_PROFILE: z.string().default('EN16931'),
  PPF_API_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  PPF_API_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  PPF_SIREN_EMETTEUR: z.preprocess(emptyToUndefined, z.string().optional()),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuration invalide :\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment validation. The server refuses to boot with an invalid
 * configuration so misconfiguration is caught immediately, not at runtime.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('*'),
  TXN_LIMIT_RUPEES: z.coerce.number().positive().default(100000),
  STARTER_BALANCE_RUPEES: z.coerce.number().nonnegative().default(12540),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`Invalid environment configuration:\n${issues}\nCopy .env.example to .env and fill it in.`);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  port: raw.PORT,
  mongoUri: raw.MONGODB_URI,
  jwtSecret: raw.JWT_SECRET,
  jwtExpiresIn: raw.JWT_EXPIRES_IN,
  corsOrigins: raw.CORS_ORIGIN === '*' ? ('*' as const) : raw.CORS_ORIGIN.split(',').map((s) => s.trim()),
  /** All money is stored in paise (integer) to avoid floating point errors. */
  txnLimitPaise: Math.round(raw.TXN_LIMIT_RUPEES * 100),
  starterBalancePaise: Math.round(raw.STARTER_BALANCE_RUPEES * 100),
} as const;

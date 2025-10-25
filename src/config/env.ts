import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  JWT_SECRET: z.string(),
  JWT_EXPIRES: z.string().default('15m'),
  REFRESH_SECRET: z.string(),
  REFRESH_EXPIRES: z.string().default('7d'),

  DATABASE_URL: z.string(),

  NESSIE_BASE_URL: z.string().optional(),
  NESSIE_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  PUBLIC_BASE_URL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // print error and exit
  // eslint-disable-next-line no-console
  console.error('Environment validation error:', parsed.error.format());
  process.exit(1);
}

export const config = {
  PORT: parsed.data.PORT ? Number(parsed.data.PORT) : undefined,
  NODE_ENV: parsed.data.NODE_ENV,
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES: parsed.data.JWT_EXPIRES,
  REFRESH_SECRET: parsed.data.REFRESH_SECRET,
  REFRESH_EXPIRES: parsed.data.REFRESH_EXPIRES,
  DATABASE_URL: parsed.data.DATABASE_URL,
  NESSIE_BASE_URL: parsed.data.NESSIE_BASE_URL,
  NESSIE_API_KEY: parsed.data.NESSIE_API_KEY,
  ELEVENLABS_API_KEY: parsed.data.ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID: parsed.data.ELEVENLABS_VOICE_ID,
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY,
  PUBLIC_BASE_URL: parsed.data.PUBLIC_BASE_URL
};

export type Env = typeof config;

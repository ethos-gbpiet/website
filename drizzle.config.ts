import { config as loadEnv } from 'dotenv'
import type { Config } from 'drizzle-kit'

// Load .env.local first (Next.js convention), then fall back to .env
loadEnv({ path: '.env.local' })
loadEnv()

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config

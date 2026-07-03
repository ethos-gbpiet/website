// ─── Database client (Neon serverless + Drizzle) ─────────────────────────────
// Works in Edge runtime, Vercel serverless, and local Node.

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    if (typeof window === 'undefined') {
      // Soft-warn so dev mode without DB doesn't crash on import.
      console.warn(
        '[ethos] DATABASE_URL is not set. Database calls will fail until you ' +
        'configure your Neon connection string in .env.local (and Vercel project settings).'
      )
    }
    return 'postgresql://invalid:invalid@invalid/invalid'
  }
  return url
}

const sql = neon(getDatabaseUrl())

export const db = drizzle(sql, { schema })
export { schema }

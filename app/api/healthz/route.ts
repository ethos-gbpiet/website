// GET /api/healthz
// Returns DB connectivity status and missing environment variables.
// Safe to expose publicly — no secrets are returned, only key names.

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const REQUIRED_ENV = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

export async function GET() {
  const missing = REQUIRED_ENV.filter(k => !process.env[k])

  let db: 'ok' | 'error' | 'unconfigured' = 'unconfigured'
  let dbError: string | null = null

  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL)
      await sql`SELECT 1`
      db = 'ok'
    } catch (e: any) {
      db = 'error'
      dbError = e?.message ?? 'Unknown error'
    }
  }

  const ok = missing.length === 0 && db === 'ok'

  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      env: {
        missing,
        present: REQUIRED_ENV.filter(k => !!process.env[k]),
      },
      database: {
        status: db,
        ...(dbError ? { error: dbError } : {}),
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL ?? null,
      },
    },
    { status: ok ? 200 : 503 },
  )
}

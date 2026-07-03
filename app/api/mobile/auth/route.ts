// POST /api/mobile/auth
// Mobile-app login endpoint — returns user info + role as JSON.
// Uses the same bcrypt check as NextAuth credentials provider.

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { z } from 'zod'

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  // Allow cross-origin requests from the mobile app
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password format' }, { status: 400, headers })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const found = await db
    .select({
      id:    users.id,
      email: users.email,
      name:  users.name,
      role:  users.role,
      active: users.active,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const user = found[0]
  if (!user || !user.active) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401, headers })
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401, headers })
  }

  return NextResponse.json({
    id:    user.id,
    email: user.email,
    name:  user.name,
    role:  user.role,
  }, { headers })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

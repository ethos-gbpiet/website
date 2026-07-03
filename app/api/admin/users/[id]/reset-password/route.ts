// POST /api/admin/users/[id]/reset-password
// super_admin: can reset anyone's password
// user: can reset their own password (via member settings page)

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { users, activityLogs } from '@/lib/db/schema'
import type { Role } from '@/lib/permissions'
import { z } from 'zod'

const Schema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await getServerSession(authOptions)
  const actor = s?.user as { id: string; role: Role } | undefined
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isSelf = actor.id === id
  if (!isSelf && actor.role !== 'super_admin') {
    return NextResponse.json({ error: "Only super admins can reset other users' passwords" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const target = (await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, id)).limit(1))[0]
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const hash = await bcrypt.hash(parsed.data.password, 10)
  await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, id))

  db.insert(activityLogs).values({
    actorId: actor.id,
    action: isSelf ? 'password.changed.self' : 'password.reset',
    target: `${target.name} (${id})`,
    meta: { byRole: actor.role },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}

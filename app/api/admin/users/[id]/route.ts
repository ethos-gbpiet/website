// GET    /api/admin/users/[id]  → get single user
// PATCH  /api/admin/users/[id]  → update (name, email, role, active)
// DELETE /api/admin/users/[id]  → delete (super_admin only, cannot delete self)

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { hasRole, type Role } from '@/lib/permissions'
import { z } from 'zod'

async function getActor() {
  const s = await getServerSession(authOptions)
  return s?.user as { id: string; role: Role } | undefined
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await getActor()
  if (!actor || !hasRole(actor.role, 'admin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const row = (await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt })
    .from(users).where(eq(users.id, id)).limit(1))[0]
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

const PatchSchema = z.object({
  name:   z.string().min(2).max(100).optional(),
  email:  z.string().email().optional(),
  role:   z.enum(['user', 'creator', 'faculty', 'admin', 'super_admin']).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await getActor()
  if (!actor || !hasRole(actor.role, 'admin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  const data = parsed.data
  if (data.role && actor.role !== 'super_admin') delete data.role
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id))
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await getActor()
  if (!actor || actor.role !== 'super_admin') return NextResponse.json({ error: 'Only super admins can delete users' }, { status: 403 })
  if (actor.id === id) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  const target = (await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1))[0]
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.delete(users).where(eq(users.id, id))
  return NextResponse.json({ ok: true })
}

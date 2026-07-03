// GET  /api/admin/users          → list users (admin+, optional ?role=)
// POST /api/admin/users          → create user (super_admin)

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq, sql } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { users, adminPermissions } from '@/lib/db/schema'
import { hasRole, defaultAdminPermissions, type Role } from '@/lib/permissions'
import { z } from 'zod'

async function getActor() {
  const s = await getServerSession(authOptions)
  return s?.user as { id: string; role: Role } | undefined
}

export async function GET(req: NextRequest) {
  const actor = await getActor()
  if (!actor || !hasRole(actor.role, 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = req.nextUrl.searchParams.get('role')
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(role ? eq(users.role, role as any) : sql`true`)
    .orderBy(users.createdAt)
  return NextResponse.json(rows)
}

const CreateSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['user', 'creator', 'faculty', 'admin', 'super_admin']),
})

export async function POST(req: NextRequest) {
  const actor = await getActor()
  if (!actor || actor.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can create users' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const { name, email, password, role } = parsed.data
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
  }
  const hash = await bcrypt.hash(password, 10)
  const [created] = await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    role: role as any,
    createdById: actor.id,
  }).returning({ id: users.id })

  // Auto-create admin_permissions row for admins
  if (role === 'admin') {
    await db.insert(adminPermissions).values({ userId: created.id, ...defaultAdminPermissions }).onConflictDoNothing()
  }

  return NextResponse.json({ id: created.id }, { status: 201 })
}

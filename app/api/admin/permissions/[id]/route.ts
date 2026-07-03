// GET /api/admin/permissions/[id]  → get admin permissions row
// PUT /api/admin/permissions/[id]  → update (super_admin only)

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { adminPermissions, activityLogs } from '@/lib/db/schema'
import { defaultAdminPermissions, type Role } from '@/lib/permissions'
import { z } from 'zod'

const PermsSchema = z.object({
  canEditHome:          z.boolean().optional(),
  canEditAbout:         z.boolean().optional(),
  canEditAnnouncements: z.boolean().optional(),
  canEditProjects:      z.boolean().optional(),
  canEditEvents:        z.boolean().optional(),
  canEditResources:     z.boolean().optional(),
  canEditGallery:       z.boolean().optional(),
  canManageMembers:     z.boolean().optional(),
  canMarkAttendance:    z.boolean().optional(),
  canViewInbox:         z.boolean().optional(),
  canActionInbox:       z.boolean().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await getServerSession(authOptions)
  const actor = s?.user as { id: string; role: Role } | undefined
  if (!actor || (actor.role !== 'super_admin' && actor.id !== id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const row = (await db.select().from(adminPermissions).where(eq(adminPermissions.userId, id)).limit(1))[0]
  return NextResponse.json(row ?? { userId: id, ...defaultAdminPermissions })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await getServerSession(authOptions)
  const actor = s?.user as { id: string; role: Role } | undefined
  if (!actor || actor.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can update permissions' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const parsed = PermsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await db.insert(adminPermissions)
    .values({ userId: id, ...defaultAdminPermissions, ...parsed.data })
    .onConflictDoUpdate({ target: adminPermissions.userId, set: parsed.data })

  db.insert(activityLogs).values({
    actorId: actor.id,
    action: 'permissions.updated',
    target: id,
    meta: parsed.data,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}

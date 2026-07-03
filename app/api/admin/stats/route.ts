// GET /api/admin/stats — platform-wide counts for dashboards

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { users, projects, events, announcements, inboxItems, teamMembers, resources } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'
import { hasRole, type Role } from '@/lib/permissions'

export async function GET() {
  const s = await getServerSession(authOptions)
  const actor = s?.user as { id: string; role: Role } | undefined
  if (!actor || !hasRole(actor.role, 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    [{ c: userCount }], [{ c: projectCount }], [{ c: eventCount }],
    [{ c: announcementCount }], [{ c: inboxNew }], [{ c: teamCount }],
    [{ c: resourceCount }], roleCounts,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users),
    db.select({ c: sql<number>`count(*)::int` }).from(projects),
    db.select({ c: sql<number>`count(*)::int` }).from(events),
    db.select({ c: sql<number>`count(*)::int` }).from(announcements),
    db.select({ c: sql<number>`count(*)::int` }).from(inboxItems).where(eq(inboxItems.status, 'new')),
    db.select({ c: sql<number>`count(*)::int` }).from(teamMembers),
    db.select({ c: sql<number>`count(*)::int` }).from(resources),
    db.select({ role: users.role, c: sql<number>`count(*)::int` }).from(users).groupBy(users.role),
  ])

  return NextResponse.json({
    users:         userCount,
    projects:      projectCount,
    events:        eventCount,
    announcements: announcementCount,
    inboxNew:      inboxNew,
    team:          teamCount,
    resources:     resourceCount,
    byRole:        Object.fromEntries(roleCounts.map(r => [r.role, r.c])),
  })
}

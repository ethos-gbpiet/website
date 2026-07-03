// GET    /api/apprentices              → admin: own apprentices. super_admin: full mentor map + unassigned pool.
// POST   /api/apprentices              → assign a mentor to a member/creator { userId, mentorId }
// DELETE /api/apprentices?userId=      → unassign (clear mentorId)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { users, memberProfiles } from '@/lib/db/schema'
import { eq, or, isNull } from 'drizzle-orm'

function actor(s: any) {
  return s?.user as { id: string; role: string } | undefined
}

async function ensureProfile(userId: string) {
  await db.insert(memberProfiles).values({ userId }).onConflictDoNothing()
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u || !['admin', 'super_admin'].includes(u.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Every member/creator, with their mentor id (auto-creating missing profile rows).
  const memberRows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(or(eq(users.role, 'user'), eq(users.role, 'creator')))

  for (const m of memberRows) await ensureProfile(m.id)

  const profileRows = await db.select().from(memberProfiles)
  const mentorOf: Record<string, string | null> = {}
  for (const p of profileRows) mentorOf[p.userId] = p.mentorId ?? null

  if (u.role === 'admin') {
    const mine = memberRows
      .filter(m => mentorOf[m.id] === u.id)
      .map(m => ({ ...m, mentorId: u.id }))
    return NextResponse.json({ apprentices: mine })
  }

  // super_admin: full picture
  const mentors = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(or(eq(users.role, 'admin'), eq(users.role, 'super_admin')))

  const assignments = memberRows
    .filter(m => !!mentorOf[m.id])
    .map(m => ({ ...m, mentorId: mentorOf[m.id] }))

  const unassigned = memberRows.filter(m => !mentorOf[m.id])

  return NextResponse.json({ mentors, assignments, unassigned })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u || !['admin', 'super_admin'].includes(u.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { userId, mentorId } = body as { userId?: string; mentorId?: string }
  if (!userId || !mentorId) {
    return NextResponse.json({ error: 'userId and mentorId are required' }, { status: 400 })
  }

  const [target] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, userId))
  if (!target || !['user', 'creator'].includes(target.role)) {
    return NextResponse.json({ error: 'Target must be a member or creator' }, { status: 400 })
  }

  const [mentor] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, mentorId))
  if (!mentor || !['admin', 'super_admin'].includes(mentor.role)) {
    return NextResponse.json({ error: 'Mentor must be an admin or super admin' }, { status: 400 })
  }

  if (u.role === 'admin') {
    if (mentorId !== u.id) {
      return NextResponse.json({ error: 'Admins can only assign apprentices to themselves' }, { status: 403 })
    }
    const [existing] = await db.select({ mentorId: memberProfiles.mentorId }).from(memberProfiles).where(eq(memberProfiles.userId, userId))
    if (existing?.mentorId && existing.mentorId !== u.id) {
      return NextResponse.json({ error: 'This person is already assigned to another mentor' }, { status: 403 })
    }
  }

  await ensureProfile(userId)
  await db.update(memberProfiles).set({ mentorId }).where(eq(memberProfiles.userId, userId))

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u || !['admin', 'super_admin'].includes(u.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  if (u.role === 'admin') {
    const [existing] = await db.select({ mentorId: memberProfiles.mentorId }).from(memberProfiles).where(eq(memberProfiles.userId, userId))
    if (!existing || existing.mentorId !== u.id) {
      return NextResponse.json({ error: 'This is not one of your apprentices' }, { status: 403 })
    }
  }

  await db.update(memberProfiles).set({ mentorId: null }).where(eq(memberProfiles.userId, userId))
  return NextResponse.json({ ok: true })
}

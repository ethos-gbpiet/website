// GET /api/attendance/stats?memberId=   → work-hours summary for one member
// GET /api/attendance/stats?all=true    → summary for every member/creator in scope (admin/super_admin/faculty)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { attendanceRecords, users, memberProfiles } from '@/lib/db/schema'
import { eq, inArray, or } from 'drizzle-orm'

function actor(s: any) {
  return s?.user as { id: string; role: string } | undefined
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const all      = searchParams.get('all') === 'true'
  const memberId = searchParams.get('memberId')

  const isElevated = ['admin', 'super_admin', 'faculty'].includes(u.role)

  if (all && !isElevated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const targetId = isElevated ? (memberId ?? null) : u.id

  if (!all && targetId) {
    if (u.role === 'admin' && targetId !== u.id) {
      const [profile] = await db
        .select({ mentorId: memberProfiles.mentorId })
        .from(memberProfiles)
        .where(eq(memberProfiles.userId, targetId))
      if (!profile || profile.mentorId !== u.id) {
        return NextResponse.json({ error: 'This person is not one of your apprentices' }, { status: 403 })
      }
    }

    // Single member stats
    const rows = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.memberId, targetId))

    const totalDays    = rows.length
    const present      = rows.filter(r => r.status === 'present').length
    const late         = rows.filter(r => r.status === 'late').length
    const absent       = rows.filter(r => r.status === 'absent').length
    const onLeave      = rows.filter(r => r.status === 'leave').length
    const totalHours   = rows.reduce((s, r) => s + r.workHours, 0)

    // Monthly breakdown
    const monthly: Record<string, { hours: number; days: number }> = {}
    for (const r of rows) {
      const month = r.date.slice(0, 7)
      if (!monthly[month]) monthly[month] = { hours: 0, days: 0 }
      monthly[month].hours += r.workHours
      if (r.status === 'present' || r.status === 'late') monthly[month].days++
    }

    return NextResponse.json({ totalDays, present, late, absent, onLeave, totalHours, monthly })
  }

  // All-members aggregate (admin/super_admin/faculty view)
  let memberIdScope: string[] | null = null
  if (u.role === 'admin') {
    const rows = await db
      .select({ userId: memberProfiles.userId })
      .from(memberProfiles)
      .where(eq(memberProfiles.mentorId, u.id))
    memberIdScope = rows.map(r => r.userId)
    if (memberIdScope.length === 0) return NextResponse.json([])
  }

  const baseCondition = or(eq(users.role, 'user'), eq(users.role, 'creator'))
  const allMembers = await db
    .select({
      id:    users.id,
      name:  users.name,
      email: users.email,
      role:  users.role,
    })
    .from(users)
    .where(memberIdScope ? inArray(users.id, memberIdScope) : baseCondition)

  const allRecords = await db.select().from(attendanceRecords)

  const result = allMembers.map(member => {
    const records = allRecords.filter(r => r.memberId === member.id)
    const totalHours = records.reduce((s, r) => s + r.workHours, 0)
    const present    = records.filter(r => r.status === 'present').length
    const late       = records.filter(r => r.status === 'late').length
    return { ...member, totalHours, present, late, totalDays: records.length }
  })

  return NextResponse.json(result)
}

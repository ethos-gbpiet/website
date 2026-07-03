// GET  /api/attendance?memberId=&month=YYYY-MM   → list records
// POST /api/attendance                           → upsert record (super_admin, or admin for own apprentices)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { attendanceRecords, memberProfiles } from '@/lib/db/schema'
import { eq, and, like, desc, inArray } from 'drizzle-orm'

function actor(session: any) {
  return session?.user as { id: string; role: string } | undefined
}

// Returns the list of memberIds an `admin` is allowed to touch (their apprentices).
// super_admin / faculty are unrestricted (returns null = "no restriction").
async function allowedScope(u: { id: string; role: string }): Promise<string[] | null> {
  if (u.role !== 'admin') return null
  const rows = await db
    .select({ userId: memberProfiles.userId })
    .from(memberProfiles)
    .where(eq(memberProfiles.mentorId, u.id))
  return rows.map(r => r.userId)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const memberId = searchParams.get('memberId')
  const month    = searchParams.get('month')   // YYYY-MM

  const isElevated = ['admin', 'super_admin', 'faculty'].includes(u.role)

  // Members/creators can only ever see their own records.
  if (!isElevated) {
    const conditions = [eq(attendanceRecords.memberId, u.id)]
    if (month) conditions.push(like(attendanceRecords.date, `${month}%`))
    const rows = await db.select().from(attendanceRecords).where(and(...conditions)).orderBy(desc(attendanceRecords.date))
    return NextResponse.json(rows)
  }

  const scope = await allowedScope(u) // null for super_admin/faculty, string[] for admin

  if (memberId) {
    if (scope && !scope.includes(memberId)) {
      return NextResponse.json({ error: 'This person is not one of your apprentices' }, { status: 403 })
    }
    const conditions = [eq(attendanceRecords.memberId, memberId)]
    if (month) conditions.push(like(attendanceRecords.date, `${month}%`))
    const rows = await db.select().from(attendanceRecords).where(and(...conditions)).orderBy(desc(attendanceRecords.date))
    return NextResponse.json(rows)
  }

  // No memberId specified — return records for every member in scope (all, for super_admin/faculty).
  const conditions = []
  if (scope) {
    if (scope.length === 0) return NextResponse.json([])
    conditions.push(inArray(attendanceRecords.memberId, scope))
  }
  if (month) conditions.push(like(attendanceRecords.date, `${month}%`))

  const rows = await db
    .select()
    .from(attendanceRecords)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(attendanceRecords.date))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const u = actor(session)
  if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['admin', 'super_admin'].includes(u.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { memberId, date, status, workHours = 0, notes = '' } = body

  if (!memberId || !date || !status) {
    return NextResponse.json({ error: 'memberId, date, and status are required' }, { status: 400 })
  }

  if (u.role === 'admin') {
    const scope = await allowedScope(u)
    if (!scope || !scope.includes(memberId)) {
      return NextResponse.json({ error: 'You can only mark attendance for your own apprentices' }, { status: 403 })
    }
  }

  // Upsert — update if the row already exists for this member+date
  const existing = await db
    .select()
    .from(attendanceRecords)
    .where(and(eq(attendanceRecords.memberId, memberId), eq(attendanceRecords.date, date)))
    .limit(1)

  if (existing.length > 0) {
    const [updated] = await db
      .update(attendanceRecords)
      .set({ status, workHours: Number(workHours), notes, markedBy: u.id, updatedAt: new Date() })
      .where(eq(attendanceRecords.id, existing[0].id))
      .returning()
    return NextResponse.json(updated)
  }

  const [created] = await db
    .insert(attendanceRecords)
    .values({ memberId, date, status, workHours: Number(workHours), notes, markedBy: u.id })
    .returning()

  return NextResponse.json(created, { status: 201 })
}

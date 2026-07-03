// GET /api/attendance/leaderboard?limit=10  → top members by total work hours

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { db } from '@/lib/db/client'
import { attendanceRecords, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 50)

  const allMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, 'user'))

  const allRecords = await db.select().from(attendanceRecords)

  const ranked = allMembers
    .map(member => {
      const records    = allRecords.filter(r => r.memberId === member.id)
      const totalHours = records.reduce((s, r) => s + r.workHours, 0)
      const present    = records.filter(r => r.status === 'present' || r.status === 'late').length
      return { ...member, totalHours, present }
    })
    .filter(m => m.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit)

  return NextResponse.json(ranked)
}

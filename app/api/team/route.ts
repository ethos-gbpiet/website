import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { teamMembers } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/server'
import { can } from '@/lib/permissions'
import { NO_CACHE } from '@/lib/api-data'

async function assertTeamWrite() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 })
  if (!can(user.role, 'team.write')) {
    return NextResponse.json({ ok: false, error: 'Only super admins can edit team members' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const rows = await db.select().from(teamMembers).orderBy(teamMembers.sortOrder)
  return NextResponse.json(rows, { headers: NO_CACHE })
}

export async function POST(req: NextRequest) {
  try {
    const denied = await assertTeamWrite()
    if (denied) return denied
    const b = await req.json()
    if (!b.name || !b.role) {
      return NextResponse.json({ ok: false, error: 'Name and role are required' }, { status: 400 })
    }
    const id = b.id || `tm_${Date.now()}`
    const [row] = await db.insert(teamMembers).values({
      id,
      name: b.name,
      role: b.role,
      year: b.year ?? null,
      yearNum: b.yearNum ?? null,
      bio: b.bio ?? null,
      domain: b.domain ?? null,
      avatar: b.avatar ?? null,
      github: b.github ?? null,
      linkedin: b.linkedin ?? null,
      email: b.email ?? null,
      section: b.section || 'core',
      featured: !!b.featured,
      sortOrder: b.sortOrder ?? 0,
    }).returning()
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const denied = await assertTeamWrite()
    if (denied) return denied
    const b = await req.json()
    if (!b.id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    const [row] = await db.update(teamMembers).set({
      name: b.name,
      role: b.role,
      year: b.year ?? null,
      yearNum: b.yearNum ?? null,
      bio: b.bio ?? null,
      domain: b.domain ?? null,
      avatar: b.avatar ?? null,
      github: b.github ?? null,
      linkedin: b.linkedin ?? null,
      email: b.email ?? null,
      section: b.section || 'core',
      featured: !!b.featured,
      sortOrder: b.sortOrder ?? 0,
    }).where(eq(teamMembers.id, b.id)).returning()
    if (!row) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const denied = await assertTeamWrite()
    if (denied) return denied
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    await db.delete(teamMembers).where(eq(teamMembers.id, id))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}

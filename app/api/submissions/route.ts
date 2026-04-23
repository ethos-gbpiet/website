import { NextRequest, NextResponse } from 'next/server'
import { readJsonArray, writeJson, NO_CACHE } from '@/lib/api-data'

export interface Submission {
  id: string
  memberId: string
  memberName: string
  type: 'announcement' | 'project-update' | 'event' | 'resource'
  title: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  adminNote?: string
  submittedAt: string
  reviewedAt?: string
  // type-specific fields
  category?: string
  date?: string
  venue?: string
  url?: string
  projectId?: string
}

const FILE = 'submissions.json'

export async function GET() {
  return NextResponse.json(readJsonArray<Submission>(FILE, []), { headers: NO_CACHE })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'create'
  const body = await req.json()
  const all = readJsonArray<Submission>(FILE, [])

  if (action === 'create') {
    const sub: Submission = {
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
      ...body,
    }
    writeJson(FILE, [sub, ...all])
    return NextResponse.json({ ok: true, id: sub.id })
  }

  if (action === 'review') {
    // Admin approves or rejects, optionally publishes
    const { id, status, adminNote } = body
    const updated = all.map(s =>
      s.id === id
        ? { ...s, status, adminNote: adminNote || '', reviewedAt: new Date().toISOString().slice(0, 10) }
        : s
    )
    writeJson(FILE, updated)

    // If approved, publish the content to its respective data file
    if (status === 'approved') {
      const sub = updated.find(s => s.id === id)!
      await publishSubmission(sub)
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    writeJson(FILE, all.filter(s => s.id !== body.id))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ─── Auto-publish approved submissions ────────────────────────────────────────
async function publishSubmission(sub: Submission) {
  const { readJsonArray, writeJson } = await import('@/lib/api-data')

  if (sub.type === 'announcement') {
    const list = readJsonArray('announcements.json', []) as any[]
    writeJson('announcements.json', [{
      id: `ann_${sub.id}`,
      title: sub.title,
      content: sub.body,
      category: sub.category || 'General',
      pinned: false,
      author: sub.memberName,
      date: sub.submittedAt,
    }, ...list])
  }

  if (sub.type === 'event') {
    const list = readJsonArray('events.json', []) as any[]
    writeJson('events.json', [...list, {
      id: `evt_${sub.id}`,
      title: sub.title,
      description: sub.body,
      date: sub.date || '',
      time: '',
      venue: sub.venue || '',
      category: sub.category || 'Workshop',
      status: 'Upcoming',
      registrations: 0,
      capacity: 50,
      fee: 'Free',
    }])
  }

  if (sub.type === 'resource') {
    const list = readJsonArray('resources.json', []) as any[]
    writeJson('resources.json', [...list, {
      id: `res_${sub.id}`,
      title: sub.title,
      description: sub.body,
      type: 'link',
      category: sub.category || 'General',
      url: sub.url || '#',
    }])
  }

  if (sub.type === 'project-update') {
    const projects = readJsonArray('projects.json', []) as any[]
    writeJson('projects.json', projects.map((p: any) =>
      p.id === sub.projectId
        ? { ...p, updates: [{ date: sub.submittedAt, title: sub.title, body: sub.body }, ...(p.updates || [])] }
        : p
    ))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { readJsonArray, writeJson, NO_CACHE } from '@/lib/api-data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberAccount {
  id: string
  username: string
  password: string
  name: string
  email: string
  role: string
  year: string
  yearNum: number
  domain: string
  bio: string
  teamMemberId?: string
  photo?: string
  resume?: string
  github?: string
  linkedin?: string
  instagram?: string
  twitter?: string
  website?: string
  createdAt: string
  approved: boolean
}

const FILE = 'member-accounts.json'

const seed: MemberAccount[] = [
  {
    id: 'demo_member',
    username: 'arjun',
    password: 'Member@123',
    name: 'Arjun Mehta',
    email: 'arjun@iet.edu',
    role: 'super_admin',
    year: '4th Year, ECE',
    yearNum: 4,
    domain: 'FPGA & Digital',
    bio: 'Hardware architect behind the 32-bit RISC-V core project.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    createdAt: '2025-01-01',
    approved: true,
  },
]

function load(): MemberAccount[] {
  return readJsonArray<MemberAccount>(FILE, seed)
}

function save(accounts: MemberAccount[]) {
  writeJson(FILE, accounts)
}

// ─── Sync member → team members table ────────────────────────────────────────

async function syncToTeamMember(account: MemberAccount) {
  try {
    const yearNum = account.yearNum ?? parseYearNum(account.year)
    const section = roleToSection(account.role)

    const payload = {
      id:          account.teamMemberId || `tm_${account.id}`,
      name:        account.name,
      role:        account.role,
      year:        account.year,
      yearNum,
      bio:         account.bio,
      domain:      account.domain,
      photo:       account.photo ?? null,
      github:      account.github ?? null,
      linkedin:    account.linkedin ?? null,
      instagram:   account.instagram ?? null,
      twitter:     account.twitter ?? null,
      website:     account.website ?? null,
      email:       account.email,
      resume:      account.resume ?? null,
      section,
      featured:    false,
      sortOrder:   0,
      exMember:    false,
      memberAccountId: account.id,
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const putRes = await fetch(`${baseUrl}/api/team`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!putRes.ok) {
      await fetch(`${baseUrl}/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async r => {
        if (r.ok) {
          const created = await r.json()
          const accounts = load()
          save(accounts.map(a =>
            a.id === account.id ? { ...a, teamMemberId: created.id } : a
          ))
        }
      })
    }
  } catch {
    // Sync failure is non-fatal
  }
}

function parseYearNum(year: string): number {
  if (!year) return 0
  if (year.startsWith('4')) return 4
  if (year.startsWith('3')) return 3
  if (year.startsWith('2')) return 2
  if (year.startsWith('1')) return 1
  return 5
}

function roleToSection(role: string): string {
  const map: Record<string, string> = {
    hod:                 'faculty',
    faculty_coordinator: 'faculty',
    faculty:             'faculty',
    super_admin:         'leadership',
    admin:               'leadership',
    technical_lead:      'technical',
    events_lead:         'events',
    content_lead:        'core',
    design_lead:         'core',
    core:                'core',
    coordinator:         'core',
    creator:             'member',
    user:                'member',
    member:              'member',
  }
  return map[role] ?? 'member'
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const accounts = load()

  if (action === 'list') {
    return NextResponse.json(accounts.map(({ password: _, ...a }) => a), { headers: NO_CACHE })
  }

  if (action === 'login') {
    const username = searchParams.get('username')
    const password = searchParams.get('password')
    const account = accounts.find(a => a.username === username && a.password === password)
    if (!account) return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    if (!account.approved) return NextResponse.json({ ok: false, error: 'Account pending admin approval' }, { status: 403 })
    const { password: _, ...safe } = account
    return NextResponse.json({ ok: true, member: safe })
  }

  if (action === 'profile') {
    const id = searchParams.get('id')
    const account = accounts.find(a => a.id === id)
    if (!account) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    const { password: _, ...safe } = account
    return NextResponse.json(safe)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'register'
  const body = await req.json()
  const accounts = load()

  if (action === 'register') {
    if (accounts.find(a => a.username === body.username)) {
      return NextResponse.json({ ok: false, error: 'Username already taken' }, { status: 409 })
    }
    const newAccount: MemberAccount = {
      id: `mem_${Date.now()}`,
      username: body.username,
      password: body.password,
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      year: body.year || '',
      yearNum: body.yearNum ?? parseYearNum(body.year || ''),
      domain: body.domain || '',
      bio: body.bio || '',
      github: body.github || '',
      linkedin: body.linkedin || '',
      instagram: body.instagram || '',
      twitter: body.twitter || '',
      website: body.website || '',
      createdAt: new Date().toISOString().slice(0, 10),
      approved: false,
    }
    save([...accounts, newAccount])
    return NextResponse.json({ ok: true, message: 'Registration submitted. Await admin approval.' })
  }

  if (action === 'update') {
    const { id, password: _pw, approved: _ap, ...updates } = body
    const updated = accounts.map(a => a.id === id ? { ...a, ...updates } : a)
    save(updated)
    const updatedAccount = updated.find(a => a.id === id)!
    if (updatedAccount.approved) {
      await syncToTeamMember(updatedAccount)
    }
    const { password: _, ...safe } = updatedAccount
    return NextResponse.json({ ok: true, member: safe })
  }

  if (action === 'approve') {
    const { id, approved } = body
    const updated = accounts.map(a => a.id === id ? { ...a, approved } : a)
    save(updated)
    if (approved) {
      const account = updated.find(a => a.id === id)
      if (account) await syncToTeamMember(account)
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    save(accounts.filter(a => a.id !== body.id))
    return NextResponse.json({ ok: true })
  }

  if (action === 'reset-password') {
    const { id, newPassword } = body
    save(accounts.map(a => a.id === id ? { ...a, password: newPassword } : a))
    return NextResponse.json({ ok: true })
  }

  if (action === 'sync-team') {
    const { id } = body
    const toSync = id
      ? accounts.filter(a => a.id === id && a.approved)
      : accounts.filter(a => a.approved)
    await Promise.all(toSync.map(syncToTeamMember))
    return NextResponse.json({ ok: true, synced: toSync.length })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

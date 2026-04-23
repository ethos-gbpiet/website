import { NextRequest, NextResponse } from 'next/server'
import { readJsonArray, writeJson, NO_CACHE } from '@/lib/api-data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberAccount {
  id: string
  username: string
  password: string          // plain text for simplicity; hash in production
  name: string
  email: string
  role: string
  year: string
  domain: string
  bio: string
  teamMemberId?: string     // links to team member entry
  photo?: string            // base64
  resume?: string           // base64 PDF
  github?: string
  linkedin?: string
  createdAt: string
  approved: boolean         // admin must approve before member can log in
}

const FILE = 'member-accounts.json'

const seed: MemberAccount[] = [
  {
    id: 'demo_member',
    username: 'arjun',
    password: 'Member@123',
    name: 'Arjun Mehta',
    email: 'arjun@iet.edu',
    role: 'President',
    year: '4th Year, ECE',
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

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const accounts = load()

  if (action === 'list') {
    // Admin: return all accounts (without passwords)
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

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'register'
  const body = await req.json()
  const accounts = load()

  if (action === 'register') {
    // Self-registration — requires admin approval
    if (accounts.find(a => a.username === body.username)) {
      return NextResponse.json({ ok: false, error: 'Username already taken' }, { status: 409 })
    }
    const newAccount: MemberAccount = {
      id: `mem_${Date.now()}`,
      username: body.username,
      password: body.password,
      name: body.name,
      email: body.email,
      role: body.role || 'Member',
      year: body.year || '',
      domain: body.domain || '',
      bio: body.bio || '',
      github: body.github || '',
      linkedin: body.linkedin || '',
      createdAt: new Date().toISOString().slice(0, 10),
      approved: false,   // admin approves
    }
    save([...accounts, newAccount])
    return NextResponse.json({ ok: true, message: 'Registration submitted. Await admin approval.' })
  }

  if (action === 'update') {
    // Member updates own profile
    const { id, password: _pw, approved: _ap, ...updates } = body
    const updated = accounts.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
    save(updated)
    const { password: _, ...safe } = updated.find(a => a.id === id)!
    return NextResponse.json({ ok: true, member: safe })
  }

  if (action === 'approve') {
    // Admin approves/rejects
    const { id, approved } = body
    save(accounts.map(a => a.id === id ? { ...a, approved } : a))
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

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

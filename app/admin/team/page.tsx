'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Upload, X, Save, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TeamMember, defaultTeam
} from '@/lib/store'

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchTeam(): Promise<TeamMember[]> {
  try {
    const res = await fetch('/api/team', { cache: 'no-store' })
    if (!res.ok) return defaultTeam
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : defaultTeam
  } catch {
    return defaultTeam
  }
}

async function persistTeam(members: TeamMember[]): Promise<boolean> {
  try {
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(members),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── Domain options ───────────────────────────────────────────────────────────
const domains = ['PCB Design', 'Embedded Systems', 'Power Electronics', 'FPGA & Digital', 'RF & Wireless', 'Signal Processing', 'Management', 'Events', 'VLSI & Embedded', 'Other']
const sections: { value: TeamMember['section']; label: string }[] = [
  { value: 'faculty',    label: 'Faculty / Mentor' },
  { value: 'leadership', label: 'President / VP' },
  { value: 'core',       label: 'Core Committee' },
  { value: 'technical',  label: 'Technical Lead' },
  { value: 'events',     label: 'Events / Outreach' },
  { value: 'member',     label: 'Active Member' },
]
const yearOptions = [
  { value: 5, label: 'Faculty / Staff' },
  { value: 4, label: '4th Year' },
  { value: 3, label: '3rd Year' },
  { value: 2, label: '2nd Year' },
  { value: 1, label: '1st Year' },
]

const sectionColor: Record<string, string> = {
  faculty:    'bg-primary/10 text-primary border-primary/25',
  leadership: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  core:       'bg-violet-400/10 text-violet-400 border-violet-400/20',
  technical:  'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  events:     'bg-orange-400/10 text-orange-400 border-orange-400/20',
  member:     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
}

// ─── Empty member template ────────────────────────────────────────────────────
const emptyMember = (): Omit<TeamMember, 'id'> => ({
  name: '', role: '', year: '', yearNum: 1, bio: '', domain: 'PCB Design',
  section: 'member', github: '', linkedin: '', email: '', photo: undefined, resume: undefined, featured: false,
})

// ─── Avatar (initials fallback) ───────────────────────────────────────────────
function Avatar({ member, size = 10 }: { member: Partial<TeamMember>; size?: number }) {
  const colours = ['bg-cyan-400/20 text-cyan-300','bg-violet-400/20 text-violet-300','bg-amber-400/20 text-amber-300','bg-emerald-400/20 text-emerald-300','bg-pink-400/20 text-pink-300','bg-sky-400/20 text-sky-300']
  const name = member.name || '?'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colours.length

  if (member.photo) {
    return (
      <div className={`w-${size} h-${size} rounded-full overflow-hidden border-2 border-border shrink-0`}
        style={{ width: size * 4, height: size * 4 }}>
        <img src={member.photo} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className={`${colours[idx]} rounded-full border-2 border-current/30 flex items-center justify-center font-display font-bold shrink-0`}
      style={{ width: size * 4, height: size * 4, fontSize: size < 8 ? 11 : 14 }}>
      {initials}
    </div>
  )
}

// ─── Member form modal ────────────────────────────────────────────────────────
function MemberFormModal({
  initial, onSave, onClose,
}: {
  initial: Partial<TeamMember> & { id?: string }
  onSave: (data: TeamMember) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<TeamMember, 'id'>>({
    name: initial.name || '',
    role: initial.role || '',
    year: initial.year || '',
    yearNum: initial.yearNum || 1,
    bio: initial.bio || '',
    domain: initial.domain || 'PCB Design',
    section: initial.section || 'member',
    github: initial.github || '',
    linkedin: initial.linkedin || '',
    email: initial.email || '',
    photo: initial.photo,
    resume: initial.resume,
    featured: initial.featured || false,
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function handleResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('PDF must be under 5 MB'); return }
    if (file.type !== 'application/pdf') { alert('Only PDF files are accepted'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, resume: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return }
    if (!form.role.trim()) { alert('Role is required'); return }
    onSave({ id: initial.id || `m_${Date.now()}`, ...form })
  }

  const F = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-xs text-muted-foreground mb-1.5 font-mono">{label}</label>
      {children}
    </div>
  )

  const inp = "w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"

  return (
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <Card className="w-full max-w-2xl p-6 my-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">{initial.id ? 'Edit Member' : 'Add New Member'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo upload */}
          <div className="md:col-span-2 flex items-center gap-5">
            <Avatar member={form} size={16} />
            <div>
              <p className="text-sm font-medium mb-1">Profile Photo</p>
              <p className="text-xs text-muted-foreground mb-2">JPG, PNG or WebP — max 2 MB. Stored locally in browser.</p>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload photo
                </button>
                {form.photo && (
                  <button onClick={() => setForm(f => ({ ...f, photo: undefined }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </div>

          {/* Resume upload */}
          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">PDF Resume / CV</label>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-9 h-9 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-red-400">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                {form.resume
                  ? <p className="text-xs text-emerald-400 font-mono">✓ Resume uploaded</p>
                  : <p className="text-xs text-muted-foreground">No resume uploaded yet. Max 5 MB PDF.</p>
                }
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Shown on public member profile page when clicked</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => resumeRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                  <Upload className="w-3.5 h-3.5" /> {form.resume ? 'Replace' : 'Upload PDF'}
                </button>
                {form.resume && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, resume: undefined }))}
                    className="px-3 py-1.5 rounded-md border border-border text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResume} />
            </div>
          </div>

          {/* Name */}
          <F label="Full Name *" id="name">
            <input id="name" className={inp} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Arjun Mehta" />
          </F>

          {/* Role */}
          <F label="Role / Title *" id="role">
            <input id="role" className={inp} value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="PCB Design Lead" />
          </F>

          {/* Section */}
          <F label="Section" id="section">
            <select id="section" className={inp} value={form.section}
              onChange={e => setForm(f => ({ ...f, section: e.target.value as TeamMember['section'] }))}>
              {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </F>

          {/* Domain */}
          <F label="Technical Domain" id="domain">
            <select id="domain" className={inp} value={form.domain}
              onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
              {domains.map(d => <option key={d}>{d}</option>)}
            </select>
          </F>

          {/* Year number (for sorting) */}
          <F label="Year (for sorting)" id="yearNum">
            <select id="yearNum" className={inp} value={form.yearNum}
              onChange={e => setForm(f => ({ ...f, yearNum: Number(e.target.value) as TeamMember['yearNum'] }))}>
              {yearOptions.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </F>

          {/* Year display text */}
          <F label="Year & Branch (display)" id="year">
            <input id="year" className={inp} value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="3rd Year, ECE" />
          </F>

          {/* Bio */}
          <div className="md:col-span-2">
            <F label="Short Bio" id="bio">
              <textarea id="bio" rows={3} className={`${inp} resize-none`} value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Brief description of their role and skills..." />
            </F>
          </div>

          {/* Socials */}
          <F label="GitHub URL" id="github">
            <input id="github" className={inp} value={form.github}
              onChange={e => setForm(f => ({ ...f, github: e.target.value }))} placeholder="https://github.com/username" />
          </F>
          <F label="LinkedIn URL" id="linkedin">
            <input id="linkedin" className={inp} value={form.linkedin}
              onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
          </F>
          <F label="Email Address" id="email">
            <input id="email" type="email" className={inp} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="member@iet.edu" />
          </F>

          {/* Featured toggle */}
          <div className="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" id="featured" checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured member (highlight on page)</label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} variant="glow" className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Save Member
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [search, setSearch] = useState('')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchTeam().then(setMembers) }, [])

  function handleSave(data: TeamMember) {
    const exists = members.find(m => m.id === data.id)
    const updated = exists
      ? members.map(m => m.id === data.id ? data : m)
      : [...members, data]
    setMembers(updated)
    persistTeam(updated)
    setEditing(null)
    setAddingNew(false)
    flashSaved()
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this member?')) return
    const updated = members.filter(m => m.id !== id)
    setMembers(updated)
    persistTeam(updated)
    flashSaved()
  }

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetToDefaults() {
    if (!confirm('Reset all team members to defaults? This cannot be undone.')) return
    setMembers(defaultTeam)
    persistTeam(defaultTeam)
    flashSaved()
  }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase())
    const matchSection = filterSection === 'all' || m.section === filterSection
    return matchSearch && matchSection
  })

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} total members · Changes save to local browser storage instantly
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">
              ✓ Saved
            </span>
          )}
          <Button onClick={() => setAddingNew(true)} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search name, role, domain…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterSection('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${filterSection === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            All
          </button>
          {sections.map(s => (
            <button key={s.value} onClick={() => setFilterSection(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${filterSection === s.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={resetToDefaults} className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
          Reset to defaults
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {sections.map(s => {
          const count = members.filter(m => m.section === s.value).length
          return (
            <Card key={s.value} className="p-3 text-center cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setFilterSection(s.value)}>
              <p className="text-xl font-display font-bold text-primary">{count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono leading-tight">{s.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Member table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Member</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Section</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">Domain</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">Year</th>
              <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar member={m} size={9} />
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`tag text-[11px] px-2 py-0.5 rounded border ${sectionColor[m.section] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {sections.find(s => s.value === m.section)?.label ?? m.section}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground font-mono">{m.domain}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground font-mono">{m.year}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(m)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">No members match your search.</p>
        )}
      </Card>

      {/* Modals */}
      {(editing || addingNew) && (
        <MemberFormModal
          initial={editing ?? emptyMember()}
          onSave={handleSave}
          onClose={() => { setEditing(null); setAddingNew(false) }}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Upload, X, Save, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TeamMember {
  id: string
  name: string
  role: string
  year: string | null
  yearNum: number | null
  bio: string | null
  domain: string | null
  avatar: string | null
  github: string | null
  linkedin: string | null
  email: string | null
  section: string
  featured: boolean
  sortOrder: number
}

const domains = ['PCB Design', 'Embedded Systems', 'Power Electronics', 'FPGA & Digital', 'RF & Wireless', 'Signal Processing', 'Management', 'Events', 'VLSI & Embedded', 'Other']
const sections: { value: string; label: string }[] = [
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

const emptyMember = (): Omit<TeamMember, 'id'> => ({
  name: '', role: '', year: '', yearNum: 1, bio: '', domain: 'PCB Design',
  section: 'member', github: '', linkedin: '', email: '', avatar: null, featured: false, sortOrder: 0,
})

function Avatar({ member, size = 10 }: { member: Partial<TeamMember>; size?: number }) {
  const colours = ['bg-cyan-400/20 text-cyan-300','bg-violet-400/20 text-violet-300','bg-amber-400/20 text-amber-300','bg-emerald-400/20 text-emerald-300','bg-pink-400/20 text-pink-300','bg-sky-400/20 text-sky-300']
  const name = member.name || '?'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colours.length

  if (member.avatar) {
    return (
      <div className="rounded-full overflow-hidden border-2 border-border shrink-0"
        style={{ width: size * 4, height: size * 4 }}>
        <img src={member.avatar} alt={name} className="w-full h-full object-cover" />
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

function MemberFormModal({
  initial, onSave, onClose, saving,
}: {
  initial: Partial<TeamMember> & { id?: string }
  onSave: (data: Omit<TeamMember, 'id'> & { id?: string }) => void
  onClose: () => void
  saving: boolean
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
    avatar: initial.avatar ?? null,
    featured: initial.featured || false,
    sortOrder: initial.sortOrder || 0,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, avatar: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return }
    if (!form.role.trim()) { alert('Role is required'); return }
    onSave({ id: initial.id, ...form })
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">{initial.id ? 'Edit Member' : 'Add New Member'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-5">
            <Avatar member={form} size={16} />
            <div>
              <p className="text-sm font-medium mb-1">Profile Photo</p>
              <p className="text-xs text-muted-foreground mb-2">JPG, PNG or WebP — max 2 MB.</p>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload photo
                </button>
                {form.avatar && (
                  <button onClick={() => setForm(f => ({ ...f, avatar: null }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </div>

          <F label="Full Name *" id="name">
            <input id="name" className={inp} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Arjun Mehta" />
          </F>

          <F label="Role / Title *" id="role">
            <input id="role" className={inp} value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="PCB Design Lead" />
          </F>

          <F label="Section" id="section">
            <select id="section" className={inp} value={form.section}
              onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
              {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </F>

          <F label="Technical Domain" id="domain">
            <select id="domain" className={inp} value={form.domain ?? ''}
              onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
              {domains.map(d => <option key={d}>{d}</option>)}
            </select>
          </F>

          <F label="Year (for sorting)" id="yearNum">
            <select id="yearNum" className={inp} value={form.yearNum ?? 1}
              onChange={e => setForm(f => ({ ...f, yearNum: Number(e.target.value) }))}>
              {yearOptions.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </F>

          <F label="Year & Branch (display)" id="year">
            <input id="year" className={inp} value={form.year ?? ''}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="3rd Year, ECE" />
          </F>

          <div className="md:col-span-2">
            <F label="Short Bio" id="bio">
              <textarea id="bio" rows={3} className={`${inp} resize-none`} value={form.bio ?? ''}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Brief description of their role and skills..." />
            </F>
          </div>

          <F label="GitHub URL" id="github">
            <input id="github" className={inp} value={form.github ?? ''}
              onChange={e => setForm(f => ({ ...f, github: e.target.value }))} placeholder="https://github.com/username" />
          </F>
          <F label="LinkedIn URL" id="linkedin">
            <input id="linkedin" className={inp} value={form.linkedin ?? ''}
              onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
          </F>
          <F label="Email Address" id="email">
            <input id="email" type="email" className={inp} value={form.email ?? ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="member@iet.edu" />
          </F>

          <div className="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" id="featured" checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured member (highlight on page)</label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} variant="glow" className="flex-1 gap-2" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Member
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

export default function ManageTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  function toast(msg: string, ok = true) { setFeedback({ msg, ok }); setTimeout(() => setFeedback(null), 4000) }

  function load() {
    fetch('/api/team', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleSave(data: Omit<TeamMember, 'id'> & { id?: string }) {
    setSaving(true)
    const isNew = !data.id
    const res = await fetch('/api/team', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast(body.error || (isNew ? 'Failed to add member' : 'Failed to update member'), false)
      return
    }
    toast(isNew ? 'Member added' : 'Member updated')
    setEditing(null)
    setAddingNew(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this member?')) return
    const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast('Member removed'); load() }
    else {
      const body = await res.json().catch(() => ({}))
      toast(body.error || 'Failed to remove member', false)
    }
  }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.domain ?? '').toLowerCase().includes(search.toLowerCase())
    const matchSection = filterSection === 'all' || m.section === filterSection
    return matchSearch && matchSection
  })

  return (
    <div className="space-y-6 max-w-6xl">
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl ${
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} total members · changes save to the live database
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setAddingNew(true)} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      </div>

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
      </div>

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

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
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
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">No members match your search.</p>
        )}
      </Card>

      {(editing || addingNew) && (
        <MemberFormModal
          initial={editing ?? emptyMember()}
          onSave={handleSave}
          onClose={() => { setEditing(null); setAddingNew(false) }}
          saving={saving}
        />
      )}
    </div>
  )
}

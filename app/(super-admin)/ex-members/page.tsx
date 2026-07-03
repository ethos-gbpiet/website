'use client'

import { useState, useEffect } from 'react'
import { UserMinus, Plus, Edit2, Trash2, Search, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

interface ExMember {
  id: string
  name: string
  role: string
  year: string
  domain: string
  bio: string
  email?: string
  github?: string
  linkedin?: string
  instagram?: string
  section: string
  exitYear?: string
  exitReason?: string
  exMember: boolean
  photo?: string
  resume?: string
}

export default function ExMembersPage() {
  const [members, setMembers] = useState<ExMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ExMember>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newMember, setNewMember] = useState<Partial<ExMember>>({})
  const [status, setStatus] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/team?ex=1', { cache: 'no-store' })
    if (res.ok) setMembers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addExMember() {
    if (!newMember.name || !newMember.role) { setStatus('Name and role are required'); return }
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMember, exMember: true, section: 'member' }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('Ex-member added'); setShowAdd(false); setNewMember({})
      await load()
    } else {
      setStatus(data.error)
    }
  }

  async function saveEdit() {
    if (!editId) return
    const res = await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, ...editData, exMember: true }),
    })
    const data = await res.json()
    setStatus(res.ok ? 'Ex-member updated' : data.error)
    setEditId(null)
    await load()
  }

  async function restoreMember(m: ExMember) {
    if (!confirm(`Restore ${m.name} as an active member?`)) return
    const res = await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, exMember: false, exitYear: null, exitReason: null }),
    })
    if (res.ok) { setStatus(`${m.name} restored to active members`); await load() }
  }

  async function deleteMember(id: string) {
    if (!confirm('Permanently delete this ex-member profile?')) return
    const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
    if (res.ok) { setStatus('Ex-member deleted'); await load() }
  }

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-0.5">// alumni</p>
          <h1 className="text-2xl font-display font-bold">Ex-Members & Alumni</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Past members whose profiles are preserved and visible in the Alumni section of the team page.
          </p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
          <Plus className="w-4 h-4" /> Add Ex-Member
        </button>
      </div>

      {status && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-primary/20 bg-primary/5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{status}</span>
          <button onClick={() => setStatus('')} className="ml-auto text-muted-foreground hover:text-foreground"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {showAdd && (
        <div className="mb-6 p-5 rounded-2xl border border-border bg-muted/10 space-y-4">
          <h3 className="font-semibold text-sm">Add Ex-Member Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Full Name',   field: 'name' },
              { label: 'Role Held',   field: 'role' },
              { label: 'Year',        field: 'year',        placeholder: '4th Year, ECE' },
              { label: 'Domain',      field: 'domain' },
              { label: 'Exit Year',   field: 'exitYear',    placeholder: 'e.g. 2024' },
              { label: 'Exit Reason', field: 'exitReason',  placeholder: 'e.g. Graduated' },
              { label: 'Email',       field: 'email' },
              { label: 'LinkedIn',    field: 'linkedin' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">{label}</label>
                <input placeholder={placeholder}
                  value={(newMember as any)[field] || ''}
                  onChange={e => setNewMember(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Bio</label>
            <textarea rows={2} value={newMember.bio || ''}
              onChange={e => setNewMember(p => ({ ...p, bio: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addExMember} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ex-members…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Year / Domain</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Left In</th>
              <th className="px-4 py-3 text-right text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No ex-members yet.</td></tr>
            ) : filtered.map(m => (
              <>
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.name}</p>
                    {m.email && <p className="text-xs text-muted-foreground font-mono">{m.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs">{m.role}</td>
                  <td className="px-4 py-3 text-xs">
                    <p>{m.year}</p>
                    <p className="text-muted-foreground">{m.domain}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-muted-foreground">{m.exitYear || '—'}</p>
                    {m.exitReason && <p className="text-[11px] text-muted-foreground">{m.exitReason}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditId(m.id); setEditData(m) }}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => restoreMember(m)} title="Restore to active"
                        className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMember(m.id)}
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editId === m.id && (
                  <tr key={`${m.id}-edit`} className="border-b border-border bg-muted/10">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          { label: 'Exit Year',    field: 'exitYear' },
                          { label: 'Exit Reason',  field: 'exitReason' },
                          { label: 'LinkedIn',     field: 'linkedin' },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">{label}</label>
                            <input value={(editData as any)[field] || ''}
                              onChange={e => setEditData(p => ({ ...p, [field]: e.target.value }))}
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/85 transition-colors">Save</button>
                        <button onClick={() => setEditId(null)} className="px-4 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-mono">{filtered.length} ex-member(s) · These profiles appear in the Alumni section of the public team page.</p>
        </div>
      </div>
    </div>
  )
}

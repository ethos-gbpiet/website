'use client'

import { useState, useEffect } from 'react'
import {
  Users, Plus, Search, RefreshCw, CheckCircle2, XCircle, Edit2,
  Trash2, ChevronDown, ChevronUp, Link2,
} from 'lucide-react'
import { RolePill, ALL_ROLES } from '@/components/shared/role-pill'

interface MemberAccount {
  id: string
  username: string
  name: string
  email: string
  role: string
  year: string
  domain: string
  bio: string
  teamMemberId?: string
  github?: string
  linkedin?: string
  instagram?: string
  createdAt: string
  approved: boolean
}

const SECTIONS = [
  { value: 'faculty',    label: 'Faculty' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'core',       label: 'Core Committee' },
  { value: 'technical',  label: 'Technical Lead' },
  { value: 'events',     label: 'Events Team' },
  { value: 'member',     label: 'Active Member' },
]

export default function SuperAdminUsersPage() {
  const [members, setMembers] = useState<MemberAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<MemberAccount>>({})
  const [status, setStatus] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState<Partial<MemberAccount>>({ role: 'user' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/members?action=list', { cache: 'no-store' })
    if (res.ok) setMembers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function syncAll() {
    setSyncing(true); setStatus('')
    const res = await fetch('/api/members?action=sync-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    setStatus(data.ok ? `Synced ${data.synced} member(s) to team page` : data.error)
    setSyncing(false)
  }

  async function toggleApprove(id: string, approved: boolean) {
    await fetch('/api/members?action=approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    setStatus(approved ? 'Member approved — team entry created automatically' : 'Member suspended')
    await load()
  }

  async function saveEdit() {
    if (!editId) return
    const res = await fetch('/api/members?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, ...editData }),
    })
    const data = await res.json()
    setStatus(data.ok ? 'Saved & synced to team page' : data.error)
    setEditId(null)
    await load()
  }

  async function deleteMember(id: string) {
    if (!confirm('Delete this member account? This cannot be undone.')) return
    await fetch('/api/members?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setStatus('Member deleted')
    await load()
  }

  async function addUser() {
    if (!newUser.name || !newUser.username || !newUser.email) {
      setStatus('Name, username and email are required'); return
    }
    const payload = {
      ...newUser,
      password: newUser.email?.split('@')[0] + '@123',
      approved: true,
    }
    const res = await fetch('/api/members?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.ok) {
      setStatus('Member created — approving and syncing to team page…')
      // Auto-approve so it syncs to team page
      const listRes = await fetch('/api/members?action=list', { cache: 'no-store' })
      const list: MemberAccount[] = listRes.ok ? await listRes.json() : []
      const created = list.find(m => m.username === newUser.username)
      if (created) await toggleApprove(created.id, true)
      setShowAdd(false)
      setNewUser({ role: 'user' })
      await load()
    } else {
      setStatus(data.error)
    }
  }

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-0.5">// access_control</p>
          <h1 className="text-2xl font-display font-bold">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Editing a user here automatically updates their team member entry on the website.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={syncAll} disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync All to Team Page'}
          </button>
          <button onClick={() => setShowAdd(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-primary/20 bg-primary/5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{status}</span>
          <button onClick={() => setStatus('')} className="ml-auto text-muted-foreground hover:text-foreground"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add user form */}
      {showAdd && (
        <div className="mb-6 p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <h3 className="font-semibold text-sm">New Member</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Full Name',  field: 'name',     type: 'text' },
              { label: 'Username',   field: 'username', type: 'text' },
              { label: 'Email',      field: 'email',    type: 'email' },
              { label: 'Year',       field: 'year',     type: 'text', placeholder: '3rd Year, CS' },
              { label: 'Domain',     field: 'domain',   type: 'text', placeholder: 'Web Development' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">{label}</label>
                <input type={type} placeholder={placeholder}
                  value={(newUser as any)[field] || ''}
                  onChange={e => setNewUser(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Role</label>
              <select value={newUser.role || 'user'}
                onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors">
                {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addUser}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
              Create & Approve
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Year / Domain</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Team Sync</th>
                <th className="px-4 py-3 text-right text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No members found.</td></tr>
              ) : filtered.map(m => (
                <>
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.email}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">@{m.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RolePill role={m.role} /></td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{m.year}</p>
                      <p className="text-xs text-muted-foreground">{m.domain}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        m.approved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {m.approved ? '● Active' : '● Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.teamMemberId ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary">
                          <Link2 className="w-3 h-3" /> Linked
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setEditId(m.id); setEditData(m) }}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleApprove(m.id, !m.approved)}
                          title={m.approved ? 'Suspend' : 'Approve'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            m.approved
                              ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                              : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          }`}>
                          {m.approved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => deleteMember(m.id)}
                          className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editId === m.id && (
                    <tr key={`${m.id}-edit`} className="border-b border-border bg-muted/10">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[
                            { label: 'Full Name', field: 'name' },
                            { label: 'Email',     field: 'email' },
                            { label: 'Year',      field: 'year' },
                            { label: 'Domain',    field: 'domain' },
                            { label: 'GitHub',    field: 'github' },
                            { label: 'LinkedIn',  field: 'linkedin' },
                            { label: 'Instagram', field: 'instagram' },
                          ].map(({ label, field }) => (
                            <div key={field}>
                              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">{label}</label>
                              <input
                                value={(editData as any)[field] || ''}
                                onChange={e => setEditData(p => ({ ...p, [field]: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors"
                              />
                            </div>
                          ))}
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Role</label>
                            <select value={editData.role || 'user'}
                              onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors">
                              {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Team Section</label>
                            <select value={(editData as any).section || 'member'}
                              onChange={e => setEditData(p => ({ ...p, section: e.target.value } as any))}
                              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors">
                              {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Bio</label>
                          <textarea value={editData.bio || ''} rows={2}
                            onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit}
                            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/85 transition-colors">
                            Save & Sync to Team Page
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="px-4 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-mono">{filtered.length} member(s) · Editing any row automatically syncs to the public team page.</p>
        </div>
      </div>
    </div>
  )
}

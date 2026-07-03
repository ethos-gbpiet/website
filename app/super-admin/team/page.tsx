'use client'

import { useState, useEffect } from 'react'
import { Users2, Plus, Pencil, Trash2, X, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Member { id: string; name: string; role: string; year: string; domain: string; section: string; avatar: string; featured: boolean; sortOrder: number; bio?: string; github?: string; linkedin?: string; email?: string }

const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'
const blank: Omit<Member, 'id'> = { name: '', role: '', year: '', domain: '', section: 'core', avatar: '', featured: false, sortOrder: 0, bio: '', github: '', linkedin: '', email: '' }

export default function TeamPage() {
  const [members, setMembers]   = useState<Member[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<null | 'create' | 'edit'>(null)
  const [editing, setEditing]   = useState<Partial<Member>>(blank)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  function toast(msg: string, ok = true) { setFeedback({ msg, ok }); setTimeout(() => setFeedback(null), 4000) }

  const load = () => {
    fetch('/api/team').then(r => r.json()).then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) })
  }
  useEffect(load, [])

  async function save() {
    setSaving(true)
    const isNew = modal === 'create'
    const url  = isNew ? '/api/team' : `/api/team`
    const method = isNew ? 'POST' : 'PUT'
    const r = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setSaving(false)
    if (!r.ok) { toast(isNew ? 'Failed to add member' : 'Failed to update member', false); return }
    toast(isNew ? 'Member added' : 'Member updated')
    setModal(null)
    load()
  }

  async function del(id: string) {
    if (!confirm('Delete this team member?')) return
    const r = await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
    if (r.ok) { toast('Member deleted'); load() }
    else toast('Delete failed', false)
  }

  const grouped = members.reduce((acc, m) => {
    if (!acc[m.section]) acc[m.section] = []
    acc[m.section].push(m)
    return acc
  }, {} as Record<string, Member[]>)

  return (
    <div className="p-6 space-y-6">
      {feedback && (
        <div className={cn('fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl',
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive')}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-muted-foreground">// content.team — super_admin only</span>
          </div>
          <h1 className="text-2xl font-display font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the public team roster. Only super admins can edit this section.</p>
        </div>
        <button onClick={() => { setEditing(blank); setModal('create') }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-all glow-cyan">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No team members. Add one above.</div>
      ) : (
        Object.entries(grouped).map(([section, list]) => (
          <div key={section}>
            <h2 className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">
              // {section}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-all group">
                  <img src={m.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                    alt={m.name} className="w-10 h-10 rounded-full border border-border object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    {m.domain && <p className="text-[10px] font-mono text-primary/70 mt-0.5 truncate">{m.domain}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(m); setModal('edit') }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(m.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">{modal === 'create' ? 'Add Team Member' : 'Edit Team Member'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: 'name',    label: 'Full Name',   placeholder: 'Arjun Mehta' },
                { key: 'role',    label: 'Title / Role', placeholder: 'President' },
                { key: 'year',    label: 'Year',         placeholder: '3rd Year, ECE' },
                { key: 'domain',  label: 'Domain',       placeholder: 'Robotics & Embedded' },
                { key: 'section', label: 'Section',      placeholder: 'core' },
                { key: 'avatar',  label: 'Avatar URL',   placeholder: 'https://…' },
                { key: 'github',  label: 'GitHub URL',   placeholder: 'https://github.com/…' },
                { key: 'linkedin',label: 'LinkedIn URL', placeholder: 'https://linkedin.com/…' },
                { key: 'email',   label: 'Email',        placeholder: 'arjun@…' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">{label}</label>
                  <input value={(editing as any)[key] ?? ''} placeholder={placeholder}
                    onChange={e => setEditing(v => ({ ...v, [key]: e.target.value }))} className={inp} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-muted-foreground mb-1">Bio</label>
                <textarea value={editing.bio ?? ''} onChange={e => setEditing(v => ({ ...v, bio: e.target.value }))}
                  rows={3} placeholder="Short bio…" className={`${inp} resize-none`} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!editing.featured} onChange={e => setEditing(v => ({ ...v, featured: e.target.checked }))} className="rounded" />
                Featured member
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={save} disabled={saving || !editing.name || !editing.role}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Member</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

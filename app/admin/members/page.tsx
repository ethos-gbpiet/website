'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle, XCircle, Trash2, Key, Search,
  UserCheck, UserX, Clock, Users, RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MemberAccount {
  id: string; username: string; name: string; email: string
  role: string; year: string; domain: string; bio: string
  github?: string; linkedin?: string
  createdAt: string; approved: boolean
}

const domainColor: Record<string, string> = {
  'PCB Design':        'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  'Embedded Systems':  'bg-violet-400/10 text-violet-400 border-violet-400/20',
  'Power Electronics': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  'FPGA & Digital':    'bg-sky-400/10 text-sky-400 border-sky-400/20',
  'RF & Wireless':     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  'Signal Processing': 'bg-pink-400/10 text-pink-400 border-pink-400/20',
  'Events':            'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'Management':        'bg-slate-400/10 text-slate-400 border-slate-400/20',
}

export default function AdminMembersPage() {
  const [members, setMembers]       = useState<MemberAccount[]>([])
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<'all' | 'pending' | 'approved'>('all')
  const [loading, setLoading]       = useState(true)
  const [saved, setSaved]           = useState(false)
  const [resetTarget, setResetTarget] = useState<MemberAccount | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [selected, setSelected]     = useState<MemberAccount | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/members?action=list', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function approve(id: string, approved: boolean) {
    await fetch('/api/members?action=approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    setMembers(m => m.map(x => x.id === id ? { ...x, approved } : x))
    flash()
  }

  async function deleteMember(id: string) {
    if (!confirm('Permanently delete this member account?')) return
    await fetch('/api/members?action=delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMembers(m => m.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
    flash()
  }

  async function resetPassword() {
    if (!resetTarget || newPassword.length < 8) return
    await fetch('/api/members?action=reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetTarget.id, newPassword }),
    })
    setResetTarget(null); setNewPassword(''); flash()
  }

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'pending' ? !m.approved : m.approved)
    return matchSearch && matchFilter
  })

  const pending  = members.filter(m => !m.approved).length
  const approved = members.filter(m => m.approved).length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Member Accounts</h1>
          <p className="text-sm text-muted-foreground">
            {members.length} total · {approved} approved · {pending} pending approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <button onClick={load} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members',       value: members.length, icon: Users,     color: 'text-primary' },
          { label: 'Pending Approval',    value: pending,        icon: Clock,     color: 'text-amber-400' },
          { label: 'Active Members',      value: approved,       icon: UserCheck, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5 text-center">
            <div className={`w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Pending approvals banner */}
      {pending > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-400/10 border border-amber-400/30">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-400">{pending} member{pending > 1 ? 's' : ''} awaiting approval</p>
            <p className="text-xs text-amber-400/70">New registrations need approval before members can log in.</p>
          </div>
          <button onClick={() => setFilter('pending')} className="ml-auto text-xs text-amber-400 border border-amber-400/40 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors shrink-0">
            Review now
          </button>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search name, username, domain…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono capitalize transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading members…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Domain</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">Registered</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(m === selected ? null : m)} className="text-left">
                      <p className="font-medium hover:text-primary transition-colors">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">@{m.username} · {m.year}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${domainColor[m.domain] || 'bg-muted text-muted-foreground border-border'}`}>
                      {m.domain}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">{m.createdAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                      m.approved
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}>
                      {m.approved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!m.approved ? (
                        <button onClick={() => approve(m.id, true)} title="Approve"
                          className="p-1.5 rounded hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => approve(m.id, false)} title="Revoke access"
                          className="p-1.5 rounded hover:bg-amber-400/10 text-muted-foreground hover:text-amber-400 transition-colors">
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => { setResetTarget(m); setNewPassword('') }} title="Reset password"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMember(m.id)} title="Delete account"
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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

      {/* Member detail panel */}
      {selected && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">{selected.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">@{selected.username} · {selected.email}</p>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
            {[
              { label: 'Role',   value: selected.role },
              { label: 'Year',   value: selected.year },
              { label: 'Domain', value: selected.domain },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted rounded-lg p-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
          {selected.bio && <p className="text-sm text-muted-foreground mb-4">{selected.bio}</p>}
          <div className="flex gap-2">
            <button onClick={() => approve(selected.id, !selected.approved)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected.approved
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20'
                  : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20'
              }`}>
              {selected.approved ? <><UserX className="w-4 h-4" /> Revoke Access</> : <><UserCheck className="w-4 h-4" /> Approve Member</>}
            </button>
          </div>
        </Card>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setResetTarget(null)}>
          <Card className="w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg mb-1">Reset Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set a new password for <strong>{resetTarget.name}</strong>.
              Share it with them securely.
            </p>
            <input type="text" placeholder="New password (min 8 chars)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4 font-mono" />
            <div className="flex gap-2">
              <Button onClick={resetPassword} variant="glow" className="flex-1 gap-2" disabled={newPassword.length < 8}>
                <Key className="w-4 h-4" /> Set Password
              </Button>
              <Button onClick={() => setResetTarget(null)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

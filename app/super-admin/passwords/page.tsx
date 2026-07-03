'use client'

import { useState, useEffect } from 'react'
import { KeyRound, Users, Eye, EyeOff, CheckCircle, AlertCircle, Search, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, type Role } from '@/lib/permissions'

interface UserRow { id: string; name: string; email: string; role: Role; active: boolean }

const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'

export default function PasswordManagementPage() {
  const [users, setUsers]           = useState<UserRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<UserRow | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [feedback, setFeedback]     = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => { setUsers(data); setLoading(false) })
  }, [])

  function toast(msg: string, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function save() {
    if (!selected || newPassword.length < 6) return
    setSaving(true)
    const r = await fetch(`/api/admin/users/${selected.id}/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    setSaving(false)
    if (r.ok) { toast(`Password updated for ${selected.name}`); setNewPassword(''); setSelected(null) }
    else toast('Failed to update password', false)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {feedback && (
        <div className={cn('fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl',
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive')}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-muted-foreground">// access_control.passwords</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Password Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Reset passwords for any platform account.</p>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 px-4 py-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
          <p><span className="text-blue-400 font-medium">Why can't I see the current password?</span></p>
          <p>EtHOS uses industry-standard one-way password hashing (bcrypt). Once a password is set, it is mathematically impossible to reverse it — even we cannot see it. This protects accounts even if the database were ever compromised.</p>
          <p>If a user forgets their password, use <strong className="text-foreground">Set New Password</strong> below to give them a fresh one. Tell them to change it after logging in.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <ul className="divide-y divide-border max-h-96 overflow-y-auto">
            {loading ? (
              <li className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></li>
            ) : filtered.map(u => (
              <li key={u.id}>
                <button onClick={() => { setSelected(u); setNewPassword('') }}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    selected?.id === u.id && 'bg-amber-500/5 border-r-2 border-amber-400')}>
                  <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-auto">{ROLE_LABELS[u.role]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Reset panel */}
        <div className="bg-card border border-border rounded-xl p-6">
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">// setting password for</p>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} className={`${inp} pr-10`} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-[11px] text-destructive mt-1">At least 6 characters required</p>
                )}
              </div>
              <button onClick={save} disabled={saving || newPassword.length < 6}
                className="w-full py-2.5 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><KeyRound className="w-4 h-4" />Set New Password</>}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select a user from the list to reset their password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

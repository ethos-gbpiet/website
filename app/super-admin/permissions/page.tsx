'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, X, Save, Loader2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: string; name: string; email: string
  perms: Record<string, boolean>
}

const PERM_LABELS: Record<string, string> = {
  canEditHome:          'Edit Home page',
  canEditAbout:         'Edit About page',
  canEditAnnouncements: 'Edit Announcements',
  canEditProjects:      'Manage Projects',
  canEditEvents:        'Manage Events',
  canEditResources:     'Manage Resources',
  canEditGallery:       'Manage Gallery',
  canManageMembers:     'Manage Members',
  canMarkAttendance:    'Mark Attendance',
  canViewInbox:         'View Inbox',
  canActionInbox:       'Action Inbox items',
}

export default function PermissionsPage() {
  const [admins, setAdmins]     = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/admin/users?role=admin')
      .then(r => r.json())
      .then(async (users: any[]) => {
        const withPerms = await Promise.all(users.map(async u => {
          const pr = await fetch(`/api/admin/permissions/${u.id}`)
          const perms = pr.ok ? await pr.json() : {}
          return { id: u.id, name: u.name, email: u.email, perms }
        }))
        setAdmins(withPerms)
        setLoading(false)
      })
  }, [])

  function toast(msg: string, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  function toggle(key: string) {
    if (!selected) return
    setSelected(s => s ? { ...s, perms: { ...s.perms, [key]: !s.perms[key] } } : s)
  }

  async function savePerms() {
    if (!selected) return
    setSaving(true)
    const r = await fetch(`/api/admin/permissions/${selected.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected.perms),
    })
    setSaving(false)
    if (r.ok) {
      toast('Permissions saved')
      setAdmins(prev => prev.map(a => a.id === selected.id ? { ...a, perms: selected.perms } : a))
    } else toast('Failed to save', false)
  }

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
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-muted-foreground">// access_control.permissions</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Admin Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Control what each admin account can access and modify.</p>
      </div>

      <div className="flex items-start gap-2 px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        Super admins always have full access. Permissions here apply only to <strong className="text-foreground">Admin</strong> accounts.
        Creator and Faculty roles have fixed built-in permissions.
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Admin list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Select Admin</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No admin users yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {admins.map(a => (
                <li key={a.id}>
                  <button onClick={() => setSelected({ ...a })}
                    className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                      selected?.id === a.id && 'bg-amber-500/5 border-r-2 border-amber-400')}>
                    <span className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[11px] font-bold text-purple-400">
                      {a.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Permission toggles */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <button onClick={savePerms} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-60 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {Object.entries(PERM_LABELS).map(([key, label]) => {
                  const on = selected.perms[key] ?? false
                  return (
                    <button key={key} onClick={() => toggle(key)}
                      className={cn('flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-all text-left text-sm',
                        on ? 'bg-emerald-500/5 border-emerald-500/20 text-foreground' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60')}>
                      <span className="leading-snug">{label}</span>
                      <div className={cn('w-8 h-4.5 rounded-full transition-colors shrink-0 flex items-center px-0.5',
                        on ? 'bg-emerald-500' : 'bg-border')}>
                        <div className={cn('w-3.5 h-3.5 rounded-full bg-white transition-transform', on ? 'translate-x-3.5' : 'translate-x-0')} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Shield className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select an admin from the list to manage their permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

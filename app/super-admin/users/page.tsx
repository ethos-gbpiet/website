'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Plus, Search, Shield, Crown, BookOpen, GraduationCap, User as UserIcon,
  KeyRound, Pencil, Trash2, Ban, CheckCircle, X, Loader2, Eye, EyeOff, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, type Role } from '@/lib/permissions'

interface UserRow {
  id: string; name: string; email: string; role: Role
  active: boolean; createdAt: string
}

const ROLE_ICON: Record<string, any> = {
  super_admin: Crown, admin: Shield, faculty: GraduationCap, creator: BookOpen, user: UserIcon,
}
const ROLE_COLOR: Record<string, string> = {
  super_admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  faculty: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  creator: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  user: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}
const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'

type Modal = null | 'create' | 'resetPassword' | 'confirm'
interface ModalState { type: Modal; userId?: string; userName?: string; confirmAction?: () => Promise<void>; confirmLabel?: string }

export default function UsersPage() {
  const [users, setUsers]       = useState<UserRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState<ModalState>({ type: null })
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)
  const [form, setForm]         = useState({ name: '', email: '', role: 'user' as Role, password: '' })
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/users')
    if (r.ok) setUsers(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function toast(msg: string, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function createUser() {
    setSaving(true)
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await r.json()
    setSaving(false)
    if (!r.ok) { toast(data.error ?? 'Failed to create user', false); return }
    toast('User created successfully')
    setModal({ type: null })
    setForm({ name: '', email: '', role: 'user', password: '' })
    load()
  }

  async function resetPassword() {
    if (!modal.userId) return
    setSaving(true)
    const r = await fetch(`/api/admin/users/${modal.userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    const data = await r.json()
    setSaving(false)
    if (!r.ok) { toast(data.error ?? 'Failed to reset password', false); return }
    toast('Password updated successfully')
    setModal({ type: null })
    setNewPassword('')
  }

  async function toggleActive(userId: string, active: boolean) {
    const r = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    if (r.ok) { toast(active ? 'User deactivated' : 'User activated'); load() }
    else toast('Update failed', false)
  }

  async function deleteUser(userId: string) {
    const r = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (r.ok) { toast('User deleted'); load() }
    else toast('Delete failed', false)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {feedback && (
        <div className={cn('fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl',
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive')}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-muted-foreground">// access_control</span>
          </div>
          <h1 className="text-2xl font-display font-bold">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all platform accounts, roles, and access.</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-all glow-cyan">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Note about passwords */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm">
        <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          <span className="text-amber-400 font-medium">About passwords:</span> For security, stored passwords are one-way hashed (bcrypt) and cannot be read back.
          Use the <strong>Reset Password</strong> button to set a new password for any user.
          The user will then log in with the new password you set.
        </p>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['User', 'Role', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  {search ? 'No users match your search.' : 'No users yet. Create one above.'}
                </td></tr>
              ) : filtered.map(u => {
                const Icon = ROLE_ICON[u.role] ?? UserIcon
                const colorCls = ROLE_COLOR[u.role] ?? ''
                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wide border', colorCls)}>
                        <Icon className="w-3 h-3" />{ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border',
                        u.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border')}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title="Reset Password"
                          onClick={() => { setModal({ type: 'resetPassword', userId: u.id, userName: u.name }); setNewPassword('') }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button title={u.active ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleActive(u.id, u.active)}
                          className={cn('p-1.5 rounded-md transition-colors',
                            u.active ? 'text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10' : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10')}>
                          {u.active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        {u.role !== 'super_admin' && (
                          <button title="Delete"
                            onClick={() => setModal({
                              type: 'confirm',
                              userId: u.id,
                              userName: u.name,
                              confirmLabel: 'Delete user permanently?',
                              confirmAction: async () => { await deleteUser(u.id); setModal({ type: null }) },
                            })}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create user modal */}
      {modal.type === 'create' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Create New User</h2>
              <button onClick={() => setModal({ type: null })} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Arjun Mehta' },
                { label: 'Email',     key: 'email', type: 'email', placeholder: 'arjun@gbpiet.ac.in' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inp} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))} className={inp}>
                  {(['user', 'creator', 'faculty', 'admin', 'super_admin'] as Role[]).map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal({ type: null })} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={createUser} disabled={saving || !form.name || !form.email || !form.password}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {modal.type === 'resetPassword' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Reset Password</h2>
              <button onClick={() => setModal({ type: null })} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Setting a new password for <span className="font-semibold text-foreground">{modal.userName}</span>.
              They will sign in with this new password.
            </p>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="New password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} className={`${inp} pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal({ type: null })} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={resetPassword} disabled={saving || newPassword.length < 6}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><KeyRound className="w-4 h-4" />Set Password</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {modal.type === 'confirm' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-display font-bold text-lg mb-2">{modal.confirmLabel}</h2>
            <p className="text-sm text-muted-foreground mb-5">This will permanently delete <strong>{modal.userName}</strong>. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ type: null })} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={modal.confirmAction} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/85 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

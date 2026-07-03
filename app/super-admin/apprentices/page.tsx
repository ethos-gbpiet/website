'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, GraduationCap, UserPlus, X, Loader2, Shield, Crown, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Person { id: string; name: string; email: string; role: string }
interface Assignment extends Person { mentorId: string }

export default function ApprenticesPage() {
  const [mentors, setMentors]         = useState<Person[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [unassigned, setUnassigned]   = useState<Person[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState<string | null>(null)
  const [feedback, setFeedback]       = useState<{ msg: string; ok: boolean } | null>(null)
  const [assignModal, setAssignModal] = useState<Person | null>(null)
  const [chosenMentor, setChosenMentor] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/apprentices', { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      setMentors(d.mentors ?? [])
      setAssignments(d.assignments ?? [])
      setUnassigned(d.unassigned ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function toast(msg: string, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3500)
  }

  async function assign(userId: string, mentorId: string) {
    setSaving(userId)
    const r = await fetch('/api/apprentices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mentorId }),
    })
    const data = await r.json().catch(() => ({}))
    setSaving(null)
    if (!r.ok) { toast(data.error ?? 'Failed to assign', false); return }
    toast('Apprentice assigned')
    setAssignModal(null)
    setChosenMentor('')
    load()
  }

  async function unassign(userId: string) {
    setSaving(userId)
    const r = await fetch(`/api/apprentices?userId=${userId}`, { method: 'DELETE' })
    setSaving(null)
    if (!r.ok) { toast('Failed to unassign', false); return }
    toast('Apprentice unassigned')
    load()
  }

  const mentorMap = Object.fromEntries(mentors.map(m => [m.id, m]))

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {feedback && (
        <div className={cn('fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl',
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive')}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-muted-foreground">// mentor_apprentice</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Apprentices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign members and creators to an admin (or yourself) as their mentor. Admins can only mark attendance for their own apprentices.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></div>
      ) : (
        <>
          {/* Mentors + their apprentices */}
          <div className="grid md:grid-cols-2 gap-4">
            {mentors.map(mentor => {
              const mine = assignments.filter(a => a.mentorId === mentor.id)
              const Icon = mentor.role === 'super_admin' ? Crown : Shield
              return (
                <div key={mentor.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{mentor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{mentor.email}</p>
                    </div>
                    <span className="ml-auto text-xs font-mono text-muted-foreground">{mine.length} apprentice{mine.length !== 1 ? 's' : ''}</span>
                  </div>
                  {mine.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">No apprentices assigned</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {mine.map(a => (
                        <li key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{a.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{a.email} · {a.role === 'creator' ? 'Creator' : 'Member'}</p>
                          </div>
                          <button onClick={() => unassign(a.id)} disabled={saving === a.id}
                            title="Unassign"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
            {mentors.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No admins yet. Create an admin account under Users & Roles first.</p>
            )}
          </div>

          {/* Unassigned pool */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-semibold text-sm">Unassigned Members &amp; Creators</h3>
              <span className="ml-auto text-xs font-mono text-muted-foreground">{unassigned.length}</span>
            </div>
            {unassigned.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Everyone has a mentor assigned.</p>
            ) : (
              <ul className="space-y-1.5">
                {unassigned.map(p => (
                  <li key={p.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.email} · {p.role === 'creator' ? 'Creator' : 'Member'}</p>
                    </div>
                    <button onClick={() => { setAssignModal(p); setChosenMentor('') }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono hover:bg-primary/20 transition-colors">
                      <UserPlus className="w-3.5 h-3.5" /> Assign
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Assign modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Assign Mentor</h2>
              <button onClick={() => setAssignModal(null)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a mentor for <span className="font-semibold text-foreground">{assignModal.name}</span>.
            </p>
            <select value={chosenMentor} onChange={e => setChosenMentor(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-5">
              <option value="">Select a mentor…</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role === 'super_admin' ? 'Super Admin' : 'Admin'})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => assign(assignModal.id, chosenMentor)} disabled={!chosenMentor || saving === assignModal.id}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-60 transition-all">
                {saving === assignModal.id ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

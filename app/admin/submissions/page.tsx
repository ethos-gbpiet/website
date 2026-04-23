'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Trash2, Filter, Loader2, Megaphone, FileText, CalendarDays, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Submission {
  id: string; type: string; title: string; body: string
  extra?: Record<string, string>; submittedBy: string; memberId: string
  submittedAt: string; status: 'pending' | 'approved' | 'rejected'; adminNote?: string
}

const statusStyle = {
  pending:  { label: 'Pending',  icon: Clock,       color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/25' },
  approved: { label: 'Approved', icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/25' },
  rejected: { label: 'Rejected', icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/25' },
}

const typeIcon: Record<string, React.ElementType> = {
  announcement: Megaphone, 'project-update': FileText, event: CalendarDays, resource: BookOpen,
}

export default function AdminSubmissionsPage() {
  const [items, setItems]       = useState<Submission[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [note, setNote]         = useState('')
  const [acting, setActing]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions', { cache: 'no-store' })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  async function review(id: string, status: 'approved' | 'rejected', adminNote = '') {
    setActing(true)
    await fetch('/api/submissions?action=review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNote }),
    })
    await loadData()
    setActing(false); setSelected(null); setNote('')
    setSaved(true); setTimeout(() => setSaved(false), 2000)

    // If approved, push content to the relevant API
    if (status === 'approved') {
      const sub = items.find(s => s.id === id)
      if (sub) await publishSubmission(sub)
    }
  }

  async function publishSubmission(sub: Submission) {
    try {
      if (sub.type === 'announcement') {
        const existing = await fetch('/api/announcements', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
        const newAnn = {
          id: `ann_${Date.now()}`, title: sub.title, content: sub.body,
          category: (sub.extra as any)?.category || 'General',
          pinned: false, author: sub.submittedBy,
          date: sub.submittedAt,
        }
        await fetch('/api/announcements', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([newAnn, ...existing]),
        })
      }

      if (sub.type === 'event') {
        const extra = (sub.extra || {}) as Record<string, string>
        const existing = await fetch('/api/events', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
        const newEvent = {
          id: `evt_${Date.now()}`, title: sub.title, description: sub.body,
          date: extra.date || '', time: '10:00 AM',
          venue: extra.venue || 'TBD', category: extra.category || 'Workshop',
          status: 'Upcoming', registrations: 0,
          capacity: parseInt(extra.audience || '50') || 50,
          fee: 'Free',
        }
        await fetch('/api/events', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([...existing, newEvent]),
        })
      }

      if (sub.type === 'resource') {
        const extra = (sub.extra || {}) as Record<string, string>
        const existing = await fetch('/api/resources', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
        const newRes = {
          id: `res_${Date.now()}`, title: sub.title, description: sub.body,
          type: extra.type || 'link', url: extra.url || '#',
          category: 'Member Submissions', size: '',
        }
        await fetch('/api/resources', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([...existing, newRes]),
        })
      }

      if (sub.type === 'project-update') {
        const extra = (sub.extra || {}) as Record<string, string>
        const existing = await fetch('/api/projects', { cache: 'no-store' }).then(r => r.json()).catch(() => [])
        // Find matching project by name and append update
        const updated = existing.map((p: any) => {
          const matches = extra.project &&
            p.title.toLowerCase().includes(extra.project.toLowerCase())
          if (!matches) return p
          return {
            ...p,
            progress: extra.progress ? parseInt(extra.progress) : p.progress,
            updates: [
              { date: sub.submittedAt, title: sub.title, body: sub.body },
              ...(p.updates || []),
            ],
          }
        })
        await fetch('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      }
    } catch (err) {
      console.error('Auto-publish failed:', err)
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this submission?')) return
    await fetch('/api/submissions?action=delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadData()
  }

  const filtered = filter === 'all' ? items : items.filter(s => s.status === filter)
  const counts = {
    pending:  items.filter(s => s.status === 'pending').length,
    approved: items.filter(s => s.status === 'approved').length,
    rejected: items.filter(s => s.status === 'rejected').length,
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Member Submissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and publish content submitted by society members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Done</span>}
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', count: counts.pending,  key: 'pending',  color: 'text-amber-400' },
          { label: 'Approved',       count: counts.approved, key: 'approved', color: 'text-emerald-400' },
          { label: 'Rejected',       count: counts.rejected, key: 'rejected', color: 'text-red-400' },
        ].map(({ label, count, key, color }) => (
          <button key={key} onClick={() => setFilter(key as any)}
            className={`p-4 rounded-xl border text-center transition-colors ${filter === key ? 'border-primary/40 bg-primary/5' : 'bg-card border-border hover:border-primary/20'}`}>
            <p className={`text-2xl font-display font-bold ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors capitalize ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {f} {f !== 'all' && `(${counts[f as keyof typeof counts] ?? items.length})`}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No {filter !== 'all' ? filter : ''} submissions.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sub => {
            const { label, icon: StatusIcon, color, bg } = statusStyle[sub.status]
            const TypeIcon = typeIcon[sub.type] || FileText
            return (
              <Card key={sub.id} className="p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{sub.title}</p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground capitalize">{sub.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{sub.body}</p>
                    <p className="text-[11px] font-mono text-muted-foreground/60">
                      By {sub.submittedBy} · {sub.submittedAt}
                    </p>
                    {sub.adminNote && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-1 italic">Note: {sub.adminNote}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${bg} ${color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />{label}
                    </span>
                    <button onClick={() => { setSelected(sub); setNote(sub.adminNote || '') }}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(sub.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">{selected.type}</p>
                <h3 className="font-display font-bold text-lg leading-tight">{selected.title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">By {selected.submittedBy} · {selected.submittedAt}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground shrink-0">×</button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto">
              {selected.body || '(no body text)'}
            </div>

            {selected.extra && Object.keys(selected.extra).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Extra Fields</p>
                {Object.entries(selected.extra).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="font-mono text-muted-foreground capitalize w-24 shrink-0">{k}:</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Admin Note (optional)</label>
              <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Reason for rejection, or feedback for the member…"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => review(selected.id, 'approved', note)} disabled={acting}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve &amp; Publish
              </button>
              <button onClick={() => review(selected.id, 'rejected', note)} disabled={acting}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-sm hover:bg-red-500/30 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

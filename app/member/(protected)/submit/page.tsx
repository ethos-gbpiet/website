'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Megaphone, FileText, CalendarDays, BookOpen, CheckCircle, Loader2 } from 'lucide-react'

interface MemberSession { id: string; name: string; username: string }

function getSession(): MemberSession | null {
  try { const r = sessionStorage.getItem('ethos_member'); return r ? JSON.parse(r) : null } catch { return null }
}

const types = [
  { id: 'announcement',   label: 'Announcement', icon: Megaphone,    desc: 'Share news, achievements, or updates with the society' },
  { id: 'project-update', label: 'Project Update', icon: FileText,   desc: 'Post progress on a project you are working on' },
  { id: 'event',          label: 'Propose Event', icon: CalendarDays, desc: 'Suggest a workshop, seminar, or hackathon idea' },
  { id: 'resource',       label: 'Share Resource', icon: BookOpen,   desc: 'Add a guide, reference sheet, or useful link' },
]

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40'

export default function SubmitPage() {
  const searchParams = useSearchParams()
  const [member, setMember] = useState<MemberSession | null>(null)
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'announcement')
  const [form, setForm] = useState({ title: '', body: '', extra: {} as Record<string, string> })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { setMember(getSession()) }, [])

  function setExtra(k: string, v: string) {
    setForm(f => ({ ...f, extra: { ...f.extra, [k]: v } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!member) return
    if (!form.title.trim()) { alert('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/submissions?action=submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeType,
          title: form.title,
          body: form.body,
          extra: form.extra,
          submittedBy: member.name,
          memberId: member.id,
        }),
      })
      const data = await res.json()
      if (data.ok) { setDone(true) } else { alert('Submission failed') }
    } catch { alert('Could not reach server') }
    setLoading(false)
  }

  function reset() { setDone(false); setForm({ title: '', body: '', extra: {} }) }

  if (done) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-16 h-16 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-display font-bold mb-2">Submission Received!</h2>
      <p className="text-muted-foreground mb-6">
        Your {types.find(t => t.id === activeType)?.label.toLowerCase()} has been sent to the admin for review.
        You can track its status on your Dashboard.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset}
          className="px-5 py-2.5 rounded-lg border border-border bg-card text-sm hover:bg-muted transition-colors">
          Submit Another
        </button>
        <a href="/member/dashboard"
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Submit Content</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All submissions go to admin review before appearing on the public site.
        </p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {types.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveType(id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 text-sm font-semibold ${
              activeType === id
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20'
            }`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Description of selected type */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 text-sm text-muted-foreground">
        {types.find(t => t.id === activeType)?.desc}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">Title *</label>
          <input className={inp} required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={
              activeType === 'announcement' ? 'e.g. EtHOS wins IEEE Challenge 2025' :
              activeType === 'project-update' ? 'e.g. LoRa Mesh — Node firmware complete' :
              activeType === 'event' ? 'e.g. Propose: Advanced Soldering Workshop' :
              'e.g. KiCad Complete Beginner Guide'
            } />
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            {activeType === 'announcement' ? 'Announcement Body' :
             activeType === 'project-update' ? 'Update Details' :
             activeType === 'event' ? 'Event Description' : 'Resource Description'}
          </label>
          <textarea className={`${inp} resize-none`} rows={5} value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Provide full details here…" />
        </div>

        {/* Type-specific extra fields */}
        {activeType === 'event' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Proposed Date</label>
              <input className={inp} value={form.extra.date || ''} onChange={e => setExtra('date', e.target.value)} placeholder="e.g. 15 April 2025" /></div>
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Venue / Mode</label>
              <input className={inp} value={form.extra.venue || ''} onChange={e => setExtra('venue', e.target.value)} placeholder="e.g. Electronics Lab / Online" /></div>
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Expected Audience</label>
              <input className={inp} value={form.extra.audience || ''} onChange={e => setExtra('audience', e.target.value)} placeholder="e.g. 30 students" /></div>
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Category</label>
              <select className={inp} value={form.extra.category || 'Workshop'} onChange={e => setExtra('category', e.target.value)}>
                {['Workshop', 'Hackathon', 'Seminar', 'Competition', 'Social', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select></div>
          </div>
        )}

        {activeType === 'project-update' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Project Name</label>
              <input className={inp} value={form.extra.project || ''} onChange={e => setExtra('project', e.target.value)} placeholder="e.g. LoRa Mesh Network" /></div>
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Progress (0–100%)</label>
              <input className={inp} type="number" min="0" max="100" value={form.extra.progress || ''} onChange={e => setExtra('progress', e.target.value)} placeholder="e.g. 65" /></div>
          </div>
        )}

        {activeType === 'resource' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Resource URL</label>
              <input className={inp} type="url" value={form.extra.url || ''} onChange={e => setExtra('url', e.target.value)} placeholder="https://…" /></div>
            <div><label className="block text-xs font-mono text-muted-foreground mb-1.5">Type</label>
              <select className={inp} value={form.extra.type || 'link'} onChange={e => setExtra('type', e.target.value)}>
                {['link', 'pdf', 'doc', 'video'].map(t => <option key={t}>{t}</option>)}
              </select></div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit for Review</>}
        </button>
      </form>
    </div>
  )
}

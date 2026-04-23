'use client'

import { useState, useEffect } from 'react'
import { Plus, GitCommit, Trash2, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { projects as seedProjects } from '@/data'

type Update = {
  id: string; projectId: string; projectTitle: string
  date: string; title: string; body: string
}

const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

export default function ManageProjectUpdates() {
  const [projects, setProjects] = useState<any[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ projectId: '', title: '', body: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : seedProjects)
      .then((data: any[]) => {
        const p = Array.isArray(data) && data.length > 0 ? data : seedProjects
        setProjects(p)
        const flat: Update[] = p.flatMap((proj: any) =>
          (proj.updates ?? []).map((u: any, i: number) => ({
            id: `${proj.id}-${i}`, projectId: proj.id,
            projectTitle: proj.title, ...u,
          }))
        ).sort((a: Update, b: Update) => b.date.localeCompare(a.date))
        setUpdates(flat)
      })
      .catch(() => setProjects(seedProjects))
  }, [])

  async function handleAdd() {
    if (!form.projectId || !form.title) { alert('Select a project and enter a title.'); return }
    const proj = projects.find(p => p.id === form.projectId)
    if (!proj) return
    const newUpdate = { date: new Date().toISOString().slice(0, 10), title: form.title, body: form.body }
    const updatedProjects = projects.map(p =>
      p.id === form.projectId
        ? { ...p, updates: [newUpdate, ...(p.updates ?? [])] }
        : p
    )
    await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProjects),
    })
    setProjects(updatedProjects)
    setUpdates([{
      id: `${form.projectId}-new-${Date.now()}`,
      projectId: form.projectId, projectTitle: proj.title, ...newUpdate,
    }, ...updates])
    setShowForm(false)
    setForm({ projectId: '', title: '', body: '' })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete(upd: Update) {
    if (!confirm('Remove this update?')) return
    const updatedProjects = projects.map(p => {
      if (p.id !== upd.projectId) return p
      return { ...p, updates: (p.updates ?? []).filter((u: any) => u.title !== upd.title || u.date !== upd.date) }
    })
    await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProjects),
    })
    setProjects(updatedProjects)
    setUpdates(updates.filter(u => u.id !== upd.id))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Project Updates</h1>
          <p className="text-sm text-muted-foreground">{updates.length} updates · saved to disk</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <Button onClick={() => setShowForm(true)} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Post Update
          </Button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Post Project Update</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Project *</label>
                <select className={inp} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                  <option value="">Select a project…</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Update Title *</label>
                <input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. PCB v2 fabricated" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Details</label>
                <textarea className={`${inp} resize-none`} rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="What was accomplished?" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={handleAdd} variant="glow" className="flex-1 gap-2"><Save className="w-4 h-4" /> Post Update</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {updates.map(upd => (
          <Card key={upd.id} className="p-4 hover:border-primary/20 transition-colors group">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <GitCommit className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-0.5">
                  <p className="font-semibold text-sm">{upd.title}</p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">{upd.projectTitle}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{upd.body}</p>
                <p className="text-[11px] font-mono text-muted-foreground/60 mt-1">{upd.date}</p>
              </div>
              <button onClick={() => handleDelete(upd)}
                className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
        {updates.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No updates posted yet.</p>
        )}
      </div>
    </div>
  )
}

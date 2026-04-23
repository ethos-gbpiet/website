'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText, Link as LinkIcon, Video, BookOpen, Save, X, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { resources as seed } from '@/data'

const typeIcon: Record<string, React.ElementType> = {
  pdf: FileText, link: LinkIcon, video: Video, doc: BookOpen,
}

const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

const empty = () => ({ title: '', description: '', url: '#', category: 'General', type: 'pdf', size: '' })

export default function ManageMedia() {
  const [items, setItems] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/resources', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : seed)
      .then(d => setItems(Array.isArray(d) && d.length > 0 ? d : seed))
      .catch(() => setItems(seed))
  }, [])

  async function persist(list: any[]) {
    setItems(list)
    await fetch('/api/resources', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleSubmit() {
    if (!form.title.trim()) { alert('Title is required'); return }
    if (editing) {
      persist(items.map(r => r.id === editing.id ? { ...editing, ...form } : r))
    } else {
      persist([{ id: `res_${Date.now()}`, ...form }, ...items])
    }
    setShowForm(false); setEditing(null); setForm(empty())
  }

  const categories = [...new Set(items.map((r: any) => r.category))]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Media &amp; Documents</h1>
          <p className="text-sm text-muted-foreground">{items.length} resources · saved to disk</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm(empty()) }} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </Button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Title *</label>
                <input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Description</label>
                <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-mono text-muted-foreground mb-1">Type</label>
                  <select className={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {['pdf', 'doc', 'link', 'video'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="block text-xs font-mono text-muted-foreground mb-1">Category</label>
                  <input className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Electronics" /></div>
              </div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">URL</label>
                <input className={inp} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://…" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">File size (optional)</label>
                <input className={inp} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="2.4 MB" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={handleSubmit} variant="glow" className="flex-1 gap-2"><Save className="w-4 h-4" /> Save</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Resource groups */}
      {categories.map(cat => (
        <div key={cat}>
          <h2 className="font-display font-semibold text-base mb-3">{cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.filter((r: any) => r.category === cat).map((r: any) => {
              const Icon = typeIcon[r.type] ?? FileText
              return (
                <Card key={r.id} className="p-4 hover:border-primary/20 transition-colors group">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{r.title}</p>
                      {r.size && <p className="text-[11px] font-mono text-muted-foreground">{r.size}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
                  <div className="flex items-center gap-2">
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline">Open ↗</a>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => { setEditing(r); setForm({ title: r.title, description: r.description, url: r.url, category: r.category, type: r.type, size: r.size || '' }); setShowForm(true) }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm('Delete?')) persist(items.filter((i: any) => i.id !== r.id)) }}
                        className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No resources yet.</p>
      )}
    </div>
  )
}

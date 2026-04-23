'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Pin, PinOff, Search, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { announcements as seed } from '@/data'

type Announcement = {
  id: string; title: string; content: string; category: string
  pinned: boolean; author: string; date: string
}

const categories = ['General', 'Recruitment', 'Achievement', 'Workshop', 'Urgent']
const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

const empty = (): Omit<Announcement, 'id' | 'date'> => ({
  title: '', content: '', category: 'General', pinned: false, author: '',
})

export default function ManageAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/announcements', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : seed)
      .then(d => setItems(Array.isArray(d) && d.length > 0 ? d : seed))
      .catch(() => setItems(seed))
  }, [])

  async function persist(list: Announcement[]) {
    setItems(list)
    await fetch('/api/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleSubmit() {
    if (!form.title.trim()) { alert('Title is required'); return }
    if (editing) {
      persist(items.map(a => a.id === editing.id ? { ...editing, ...form } : a))
    } else {
      persist([{
        id: `ann_${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        ...form,
      }, ...items])
    }
    setShowForm(false); setEditing(null); setForm(empty())
  }

  function startEdit(a: Announcement) {
    setEditing(a)
    setForm({ title: a.title, content: a.content, category: a.category, pinned: a.pinned, author: a.author })
    setShowForm(true)
  }

  const filtered = items.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">{items.length} announcements · saved to disk</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm(empty()) }} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Title *</label>
                <input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Content</label>
                <textarea className={`${inp} resize-none`} rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-mono text-muted-foreground mb-1">Category</label>
                  <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-xs font-mono text-muted-foreground mb-1">Author</label>
                  <input className={inp} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="EtHOS Team" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <label htmlFor="pinned" className="text-sm cursor-pointer">Pin to top of bulletin</label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={handleSubmit} variant="glow" className="flex-1 gap-2"><Save className="w-4 h-4" /> Save</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search announcements…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(a => (
          <Card key={a.id} className={`p-4 hover:border-primary/20 transition-colors ${a.pinned ? 'border-primary/15 bg-primary/[0.02]' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">{a.title}</p>
                  {a.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">{a.category}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                <p className="text-[11px] font-mono text-muted-foreground/60 mt-1">{a.date} · {a.author}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => persist(items.map(i => i.id === a.id ? { ...i, pinned: !i.pinned } : i))}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title={a.pinned ? 'Unpin' : 'Pin'}>
                  {a.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => startEdit(a)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm('Delete?')) persist(items.filter(i => i.id !== a.id)) }}
                  className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No announcements found.</p>}
      </div>
    </div>
  )
}

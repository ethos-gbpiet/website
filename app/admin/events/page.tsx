'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, X, Save, Search } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { events as seedData } from '@/data'

// ─── Types ────────────────────────────────────────────────────────────────────
type EventStatus = 'Upcoming' | 'Ongoing' | 'Past' | 'Flagship'

interface EtHOSEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  category: string
  status: EventStatus
  registrations: number
  capacity: number
  fee: string
}

const STORAGE_KEY = 'ethos_events' // kept for fallback key name only

async function loadEvents(): Promise<EtHOSEvent[]> {
  try {
    const res = await fetch('/api/events', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return seedData as EtHOSEvent[]
}

async function saveEvents(list: EtHOSEvent[]) {
  await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
}

// ─── Form modal ───────────────────────────────────────────────────────────────
const emptyEvent = (): EtHOSEvent => ({
  id: '', title: '', description: '', date: '', time: '10:00 AM',
  venue: '', category: 'Workshop', status: 'Upcoming', registrations: 0, capacity: 50, fee: 'Free',
})

const categories = ['Workshop', 'Hackathon', 'Seminar', 'Competition', 'Festival', 'Social', 'Other']
const statuses: EventStatus[] = ['Upcoming', 'Ongoing', 'Past', 'Flagship']

function EventModal({ initial, onSave, onClose }: {
  initial: EtHOSEvent
  onSave: (e: EtHOSEvent) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<EtHOSEvent>(initial)

  const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  function F({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-2xl p-6 my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">{form.id ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <F label="Event Title *">
              <input className={inp} value={form.title} placeholder="Hardware Hackathon 2025"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </F>
          </div>

          <F label="Date *">
            <input className={inp} value={form.date} placeholder="18 Apr 2025"
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </F>
          <F label="Time">
            <input className={inp} value={form.time} placeholder="10:00 AM"
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </F>

          <F label="Venue *">
            <input className={inp} value={form.venue} placeholder="Electronics Lab, Block C"
              onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
          </F>
          <F label="Registration Fee">
            <input className={inp} value={form.fee} placeholder="₹150 or Free"
              onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} />
          </F>

          <F label="Category">
            <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
          <F label="Status">
            <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EventStatus }))}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </F>

          <F label="Registrations">
            <input type="number" className={inp} value={form.registrations} min={0}
              onChange={e => setForm(f => ({ ...f, registrations: Number(e.target.value) }))} />
          </F>
          <F label="Capacity">
            <input type="number" className={inp} value={form.capacity} min={1}
              onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
          </F>

          <div className="md:col-span-2">
            <F label="Description">
              <textarea className={`${inp} resize-none`} rows={3} value={form.description}
                placeholder="Brief description of the event…"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </F>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => { if (!form.title || !form.date || !form.venue) { alert('Title, date, and venue are required.'); return } onSave(form) }} variant="glow" className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Save Event
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageEvents() {
  const [items, setItems] = useState<EtHOSEvent[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EtHOSEvent | null>(null)
  const [adding, setAdding] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadEvents().then(setItems) }, [])

  async function commit(list: EtHOSEvent[]) {
    setItems(list)
    await saveEvents(list)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSave(ev: EtHOSEvent) {
    const exists = items.find(i => i.id === ev.id)
    commit(exists
      ? items.map(i => i.id === ev.id ? ev : i)
      : [...items, { ...ev, id: `evt_${Date.now()}` }]
    )
    setEditing(null)
    setAdding(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this event?')) commit(items.filter(e => e.id !== id))
  }

  const filtered = items.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const statusVariant = (s: string) =>
    s === 'Upcoming' ? 'default' : s === 'Ongoing' || s === 'Flagship' ? 'success' : 'outline'

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Events</h1>
          <p className="text-sm text-muted-foreground">{items.length} events · saved to browser storage</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <Button onClick={() => setAdding(true)} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(['Upcoming', 'Ongoing', 'Flagship', 'Past'] as const).map(s => (
          <Card key={s} className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{items.filter(e => e.status === s).length}</p>
            <p className="text-xs text-muted-foreground mt-1">{s}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search events…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Registrations</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(event => {
                const pct = Math.round((event.registrations / event.capacity) * 100)
                return (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.venue}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{event.date}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="tag tag-purple">{event.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono">{event.registrations}/{event.capacity}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full w-24 overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 90 ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(event.status) as any} className="text-xs">{event.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/events/${event.id}`} target="_blank">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        </Link>
                        <button onClick={() => setEditing(event)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-sm text-muted-foreground">No events found.</p>}
        </div>
      </Card>

      {/* Modals */}
      {adding && <EventModal initial={emptyEvent()} onSave={handleSave} onClose={() => setAdding(false)} />}
      {editing && <EventModal initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  )
}

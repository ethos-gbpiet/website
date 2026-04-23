'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, Search, X, Save } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { projects as seedData } from '@/data'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjStatus = 'In Progress' | 'Completed' | 'Planning' | 'On Hold'

interface Project {
  id: string
  title: string
  tagline: string
  description: string
  category: string
  status: ProjStatus
  progress: number
  tech: string[]
  team: string[]
  startDate: string
  endDate: string
  featured: boolean
  updates: { date: string; title: string; body: string }[]
}

const STORAGE_KEY = 'ethos_projects' // kept for reference only

async function load(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return seedData as Project[]
}

async function persist(list: Project[]) {
  await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = ['Robotics', 'IoT', 'AI/ML', 'AR/VR', 'Electric Vehicles', 'FPGA & Digital', 'PCB Design', 'Power Electronics', 'RF & Wireless', 'Embedded Systems', 'Web', 'Other']
const statuses: ProjStatus[] = ['In Progress', 'Completed', 'Planning', 'On Hold']

function emptyProject(): Project {
  return {
    id: '', title: '', tagline: '', description: '', category: 'IoT',
    status: 'Planning', progress: 0, tech: [], team: [],
    startDate: '', endDate: '', featured: false, updates: [],
  }
}

// ─── Project form modal ───────────────────────────────────────────────────────
function ProjectModal({ initial, onSave, onClose }: {
  initial: Project
  onSave: (p: Project) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Project>(initial)
  const [techInput, setTechInput] = useState(initial.tech.join(', '))
  const [teamInput, setTeamInput] = useState(initial.team.join(', '))

  const inp = 'w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  function F({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1">{label}</label>
        {children}
      </div>
    )
  }

  function handleSave() {
    if (!form.title.trim()) { alert('Title is required'); return }
    onSave({
      ...form,
      tech: techInput.split(',').map(s => s.trim()).filter(Boolean),
      team: teamInput.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-2xl p-6 my-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">{form.id ? 'Edit Project' : 'Add New Project'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <F label="Project Title *">
              <input className={inp} value={form.title} placeholder="LoRa Mesh Sensor Network"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Tagline">
              <input className={inp} value={form.tagline} placeholder="Short one-line description"
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            </F>
          </div>

          <F label="Category">
            <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
          <F label="Status">
            <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjStatus }))}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </F>

          <F label="Progress (0–100)">
            <div className="space-y-2">
              <input type="range" min={0} max={100} value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-mono text-primary font-semibold">{form.progress}%</span>
                <span>100%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${form.progress}%` }} />
              </div>
            </div>
          </F>

          <div className="space-y-4">
            <F label="Start Date">
              <input className={inp} value={form.startDate} placeholder="Jan 2025"
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </F>
            <F label="End Date (est.)">
              <input className={inp} value={form.endDate} placeholder="Dec 2025"
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Tech Stack (comma-separated)">
              <input className={inp} value={techInput} placeholder="ESP32, KiCad, FreeRTOS"
                onChange={e => setTechInput(e.target.value)} />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Team Members (comma-separated)">
              <input className={inp} value={teamInput} placeholder="Arjun Mehta, Priya Sharma"
                onChange={e => setTeamInput(e.target.value)} />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Full Description">
              <textarea className={`${inp} resize-none`} rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </F>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 accent-primary" />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
              Featured project (shown on homepage)
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} variant="glow" className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Save Project
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageProjects() {
  const [items, setItems] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Project | null>(null)
  const [adding, setAdding] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { load().then(setItems) }, [])

  async function commit(list: Project[]) {
    setItems(list); await persist(list)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleSave(p: Project) {
    const exists = items.find(i => i.id === p.id)
    commit(exists
      ? items.map(i => i.id === p.id ? p : i)
      : [...items, { ...p, id: `proj_${Date.now()}` }]
    )
    setEditing(null); setAdding(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this project?')) commit(items.filter(p => p.id !== id))
  }

  const filtered = items.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">{items.length} projects · saved to browser storage</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">✓ Saved</span>}
          <Button onClick={() => setAdding(true)} variant="glow" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search projects…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(project => (
          <Card key={project.id} className="p-5 hover:border-primary/20 transition-colors group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{project.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{project.category}</p>
              </div>
              <Badge
                variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'warning' : 'outline'}
                className="text-xs shrink-0"
              >{project.status}</Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.tagline}</p>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span><span className="font-mono">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            {project.team.length > 0 && (
              <p className="text-xs text-muted-foreground mb-4 truncate">{project.team.join(', ')}</p>
            )}

            <div className="flex gap-2">
              <Link href={`/projects/${project.id}`} target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors text-muted-foreground">
                <ExternalLink className="w-3 h-3" /> View
              </Link>
              <button onClick={() => setEditing(project)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted hover:text-foreground transition-colors text-muted-foreground">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => handleDelete(project.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-muted-foreground ml-auto">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center py-16 text-muted-foreground text-sm">No projects found.</p>}

      {adding && <ProjectModal initial={emptyProject()} onSave={handleSave} onClose={() => setAdding(false)} />}
      {editing && <ProjectModal initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  )
}

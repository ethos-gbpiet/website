'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

const categories = ['All', 'Robotics', 'AI/ML', 'IoT', 'Web', 'Power Electronics']
const statuses = ['All', 'In Progress', 'Completed', 'Planning']

export default function ProjectsPage() {
  const s = useSiteSettings()
  const projects = useApiData('/api/projects', seed)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    const matchStatus = status === 'All' || p.status === status
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// all_projects</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Our <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            From autonomous drones to smart city infrastructure — explore the full range of
            engineering projects built by {s.siteName} members.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    category === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    status === s
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-sm text-muted-foreground mb-6 font-mono">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg">No projects match your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="card-hover h-full p-0 overflow-hidden group">
                    {/* Visual header */}
                    <div className="h-36 bg-gradient-to-br from-primary/10 via-transparent to-electric/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid opacity-20" />
                      <div className="absolute top-3 left-4 flex gap-1.5">
                        <span className="tag tag-cyan">{project.category}</span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 flex gap-1.5 flex-wrap">
                        {project.tech.slice(0, 3).map((t) => (
                          <span key={t} className="tag tag-purple">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start gap-2 justify-between mb-2">
                        <h2 className="font-display font-semibold leading-tight">{project.title}</h2>
                        <Badge
                          variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'warning' : 'outline'}
                          className="shrink-0 text-xs"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.tagline}</p>

                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Completion</span>
                          <span className="font-mono">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                        <span>{project.team.join(', ')}</span>
                        <span className="font-mono">{project.startDate}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

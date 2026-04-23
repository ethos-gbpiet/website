'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github, Users, Calendar, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { projects as seed } from '@/data'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : seed)
      .then((data: any[]) => {
        const found = data.find(p => p.id === id)
        setProject(found || seed.find(p => p.id === id) || null)
        setLoading(false)
      })
      .catch(() => {
        setProject(seed.find(p => p.id === id) || null)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!project) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Link href="/projects">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Projects</Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Link>
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'warning' : 'outline'}>
              {project.status}
            </Badge>
            <Badge variant="outline">{project.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{project.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">{project.tagline}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {project.description && (
              <Card className="p-6">
                <h2 className="font-display font-bold text-lg mb-3">About this Project</h2>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </Card>
            )}

            {/* Progress */}
            <Card className="p-6">
              <h2 className="font-display font-bold text-lg mb-4">Progress</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-mono font-semibold text-primary">{project.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </Card>

            {/* Updates timeline */}
            {project.updates?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display font-bold text-lg mb-4">Project Updates</h2>
                <div className="relative space-y-5">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-border" />
                  {project.updates.map((u: any, i: number) => (
                    <div key={i} className="pl-6 relative">
                      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <p className="text-xs font-mono text-muted-foreground mb-0.5">{u.date}</p>
                      <p className="font-semibold text-sm">{u.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{u.body}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Details</h3>
              <dl className="space-y-3">
                {project.startDate && (
                  <div><dt className="text-[10px] font-mono text-muted-foreground">Started</dt><dd className="text-sm">{project.startDate}</dd></div>
                )}
                {project.endDate && (
                  <div><dt className="text-[10px] font-mono text-muted-foreground">Est. End</dt><dd className="text-sm">{project.endDate}</dd></div>
                )}
              </dl>
            </Card>

            {project.tech?.length > 0 && (
              <Card className="p-5">
                <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t: string) => (
                    <span key={t} className="text-xs font-mono px-2 py-1 bg-muted rounded-md border border-border">{t}</span>
                  ))}
                </div>
              </Card>
            )}

            {project.team?.length > 0 && (
              <Card className="p-5">
                <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Team</h3>
                <div className="space-y-1">
                  {project.team.map((member: string) => (
                    <div key={member} className="flex items-center gap-2 text-sm">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      {member}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Link href="/collaborate?type=project">
              <Button variant="glow" className="w-full">Join this Project</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

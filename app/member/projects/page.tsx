'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderGit2, ExternalLink } from 'lucide-react'
import { ProjectCard } from '@/components/shared/project-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { projects as defaultProjects } from '@/data'
import { getJoinedProjects } from '@/lib/member-data'

export default function MemberProjectsPage() {
  const [joinedIds, setJoinedIds] = useState<string[]>([])

  useEffect(() => {
    setJoinedIds(getJoinedProjects().map(j => String(j.projectId)))
    const onUpdate = () => setJoinedIds(getJoinedProjects().map(j => String(j.projectId)))
    window.addEventListener('ethos-member-data-updated', onUpdate)
    return () => window.removeEventListener('ethos-member-data-updated', onUpdate)
  }, [])

  const mine = defaultProjects.filter(p => joinedIds.includes(String(p.id)))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// active</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projects you've joined or been assigned to.
          </p>
        </div>
        <Button variant="outline-primary" size="sm" asChild>
          <Link href="/projects"><ExternalLink className="w-4 h-4 mr-1.5" /> Browse projects</Link>
        </Button>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects joined"
          description="Express interest on a project page to start working with the team."
          action={
            <Button asChild>
              <Link href="/projects">Explore projects</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mine.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}

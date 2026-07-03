import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/shared/status-badge'
import { projects } from '@/data'

type Project = (typeof projects)[0]

interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'compact'
}

/**
 * Reusable project card with progress bar, tech tags, and status badge.
 */
export function ProjectCard({ project, variant = 'default' }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <Card className="card-hover h-full p-0 overflow-hidden group flex flex-col">
        {/* Visual header */}
        <div className="h-36 bg-gradient-to-br from-primary/15 via-transparent to-electric/15 relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          {/* Category tag */}
          <div className="absolute top-3 left-4">
            <span className="tag tag-cyan">{project.category}</span>
          </div>
          {/* Tech stack tags */}
          <div className="absolute bottom-3 left-4 right-4 flex gap-1.5 flex-wrap">
            {project.tech.slice(0, 3).map((t) => (
              <span key={t} className="tag tag-purple">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          {/* Title + status */}
          <div className="flex items-start gap-2 justify-between mb-2">
            <h2 className="font-display font-semibold leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h2>
            <ProjectStatusBadge status={project.status} className="shrink-0" />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {project.tagline}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5 mt-auto">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Completion</span>
              <span className="font-mono text-primary">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-electric transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <span className="truncate">{project.team.join(', ')}</span>
            <span className="font-mono shrink-0">{project.startDate}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

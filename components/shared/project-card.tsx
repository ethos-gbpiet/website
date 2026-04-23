import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/shared/status-badge'
import { projects } from '@/data'

type Project = (typeof projects)[0]

interface ProjectCardProps {
  project: Project
  /** Show a larger visual header (used on the projects listing page) */
  variant?: 'default' | 'compact'
}

/**
 * Reusable project card with progress bar, tech tags, and status badge.
 * Wraps itself in a Next.js Link to the project detail page.
 */
export function ProjectCard({ project, variant = 'default' }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="card-hover h-full p-0 overflow-hidden group">
        {/* Visual header */}
        <div className="h-36 bg-gradient-to-br from-primary/10 via-transparent to-electric/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
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

        <div className="p-5">
          {/* Title + status */}
          <div className="flex items-start gap-2 justify-between mb-2">
            <h2 className="font-display font-semibold leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h2>
            <ProjectStatusBadge status={project.status} className="shrink-0 text-xs" />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {project.tagline}
          </p>

          {/* Progress bar */}
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

          {/* Meta */}
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span className="truncate">{project.team.join(', ')}</span>
            <span className="font-mono shrink-0">{project.startDate}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

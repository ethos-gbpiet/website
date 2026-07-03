import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

/**
 * Consistent section heading with optional "view all" link.
 * Used throughout homepage and listing pages.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-mono text-primary mb-2 uppercase tracking-[0.2em]">
            {`// ${eyebrow}`}
          </p>
        )}
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all font-mono shrink-0"
        >
          {viewAllLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

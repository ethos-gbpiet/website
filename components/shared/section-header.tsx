import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
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
  viewAllHref,
  viewAllLabel = 'View all',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between mb-10', className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-mono text-primary mb-2">{eyebrow}</p>
        )}
        <h2 className="text-3xl font-display font-bold">{title}</h2>
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          {viewAllLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

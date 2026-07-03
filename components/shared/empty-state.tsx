import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

/**
 * Consistent empty / no-results state used on filtered listing pages
 * and empty admin tables.
 */
export function EmptyState({
  icon: Icon = SearchX,
  title = 'Nothing here',
  description = 'Try adjusting your filters or search term.',
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        compact ? 'py-12' : 'py-20',
        className
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border flex items-center justify-center mb-1">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

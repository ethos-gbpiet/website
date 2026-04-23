import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
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
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-24 gap-3 text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

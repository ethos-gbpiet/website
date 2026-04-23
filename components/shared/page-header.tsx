import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  className?: string
  centered?: boolean
  children?: React.ReactNode
}

/**
 * Reusable hero section header for public pages.
 * Renders the section background (bg-grid + radial glow) and
 * consistent typography for eyebrow / title / description.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  centered = false,
  children,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        'relative py-16 bg-grid overflow-hidden',
        className
      )}
    >
      {/* Radial glow overlay */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <div
        className={cn(
          'container mx-auto px-4 max-w-7xl relative',
          centered && 'text-center'
        )}
      >
        {eyebrow && (
          <p className="text-xs font-mono text-primary mb-3">
            {eyebrow}
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 max-w-3xl leading-tight">
          {title}
        </h1>

        {description && (
          <p className={cn('text-muted-foreground max-w-xl leading-relaxed', centered && 'mx-auto')}>
            {description}
          </p>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

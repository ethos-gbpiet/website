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
        'relative pt-28 pb-14 md:pt-32 md:pb-20 bg-grid bg-grid-fade overflow-hidden border-b border-border/40',
        className
      )}
    >
      {/* Radial glow overlay */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-60" />
      {/* Subtle scan line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div
        className={cn(
          'container mx-auto px-4 max-w-7xl relative',
          centered && 'text-center'
        )}
      >
        {eyebrow && (
          <p className={cn(
            'text-[11px] font-mono text-primary mb-4 uppercase tracking-[0.2em] terminal-prompt',
            centered && 'inline-flex'
          )}>
            {eyebrow}
          </p>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-5 max-w-4xl leading-[1.05] tracking-tight">
          {title}
        </h1>

        {description && (
          <p className={cn(
            'text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed',
            centered && 'mx-auto'
          )}>
            {description}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}

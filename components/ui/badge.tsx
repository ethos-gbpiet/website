import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary/15 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
        outline: 'text-muted-foreground border-border',
        cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
        purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
        green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
        red: 'border-red-500/30 bg-red-500/10 text-red-400',
        // Semantic aliases
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

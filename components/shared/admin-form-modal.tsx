'use client'

import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminFormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  submitLabel?: string
  children: React.ReactNode
  className?: string
}

/**
 * Reusable modal wrapper for admin create/edit forms.
 * Renders a semi-transparent backdrop + centred card.
 */
export function AdminFormModal({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  children,
  className,
}: AdminFormModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className={cn('w-full max-w-lg p-6', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields (children) */}
        <div className="space-y-4">{children}</div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button onClick={onSubmit} variant="glow" className="flex-1">
            {submitLabel}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}

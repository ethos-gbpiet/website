'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminFormModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  onSubmit: () => void
  submitLabel?: string
  children: React.ReactNode
  className?: string
}

/**
 * Reusable modal wrapper for admin create/edit forms.
 * Esc key closes; backdrop click closes; body scroll locked while open.
 */
export function AdminFormModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  children,
  className,
}: AdminFormModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Card
        className={cn('w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-3">
          <div>
            <h2 className="font-display font-bold text-lg">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Close"
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

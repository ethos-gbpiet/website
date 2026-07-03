'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'default' | 'success' | 'error' | 'warning'

interface ToastMessage {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextValue {
  toast: (opts: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const toast = React.useCallback((opts: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, ...opts }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-fade-up',
              t.type === 'success' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              t.type === 'error' && 'bg-red-500/10 border-red-500/30 text-red-400',
              t.type === 'warning' && 'bg-orange-500/10 border-orange-500/30 text-orange-400',
              t.type === 'default' && 'bg-card border-border text-foreground'
            )}
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs opacity-70 mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

export function Toaster() {
  return null // Toast rendering is in ToastProvider; this is a convenience export
}

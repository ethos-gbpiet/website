'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Download, FileText, Video, Database, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'

interface ResourceItem {
  id: string | number
  title: string
  type?: string
  description?: string
  url?: string
  href?: string
  size?: string
  category?: string
}

const iconFor = (t: string = '') => {
  const k = t.toLowerCase()
  if (k.includes('video')) return Video
  if (k.includes('dataset') || k.includes('data')) return Database
  if (k.includes('pdf') || k.includes('doc') || k.includes('template') || k.includes('guide')) return FileText
  return BookOpen
}

export default function MemberResourcesPage() {
  const [items, setItems] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resources', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// member_only</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Handbooks, templates, recorded sessions, and reference material curated for members.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources yet"
          description="Resources added by the admin team will show up here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((r) => {
            const Icon = iconFor(r.type)
            const link = r.url ?? r.href ?? '#'
            return (
              <a key={String(r.id)} href={link} target={link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer" className="block">
                <Card className="card-hover p-5 h-full flex gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 justify-between mb-1">
                      <h3 className="font-display font-semibold text-base leading-snug">{r.title}</h3>
                      {r.type && <Badge variant="outline" className="shrink-0">{r.type}</Badge>}
                    </div>
                    {r.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-primary font-mono">
                      {link.startsWith('http') ? <ExternalLink className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      {link.startsWith('http') ? 'Open' : 'Download'}
                      {r.size && <span className="text-muted-foreground ml-auto">{r.size}</span>}
                    </div>
                  </div>
                </Card>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { FileText, Download, BookOpen, Link as LinkIcon, Video } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { resources as seed } from '@/data'
import { useApiData } from '@/lib/use-api-data'

const typeIcon: Record<string, React.ElementType> = {
  pdf: FileText, doc: BookOpen, link: LinkIcon, video: Video,
}

export default function ResourcesPage() {
  const resources = useApiData('/api/resources', seed)
  const categories = [...new Set((resources as any[]).map((r: any) => r.category))]

  return (
    <div className="pt-20">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// resources</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Resources &amp; <span className="gradient-text">Downloads</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Guides, reference sheets, PCB templates, and curated links for EtHOS members.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {categories.map(category => {
            const items = (resources as any[]).filter((r: any) => r.category === category)
            return (
              <div key={category} className="mb-10">
                <h2 className="font-display font-bold text-xl mb-4">{category}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((r: any) => {
                    const Icon = typeIcon[r.type] ?? FileText
                    return (
                      <Card key={r.id} className="p-5 hover:border-primary/25 transition-colors card-hover group">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{r.title}</p>
                            {r.size && <p className="text-xs text-muted-foreground font-mono">{r.size}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{r.description}</p>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                          <Download className="w-3 h-3" />
                          {r.type === 'link' ? 'Open Link' : 'Download'}
                        </a>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {(resources as any[]).length === 0 && (
            <p className="text-center text-muted-foreground py-12">No resources yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

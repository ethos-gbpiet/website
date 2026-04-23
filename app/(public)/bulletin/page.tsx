'use client'

import { useState } from 'react'
import { Megaphone, Pin, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { announcements as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

const categories = ['All', 'General', 'Workshop', 'Recruitment', 'Achievement', 'Urgent']
const categoryColors: Record<string, string> = {
  General: 'tag-cyan', Workshop: 'tag-purple', Recruitment: 'tag-green',
  Achievement: 'tag-orange', Urgent: 'tag-red',
}

export default function BulletinPage() {
  const s = useSiteSettings()
  const announcements = useApiData('/api/announcements', seed)
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = announcements.filter(
    a => activeCategory === 'All' || a.category === activeCategory
  )
  const pinned  = filtered.filter(a => a.pinned)
  const regular = filtered.filter(a => !a.pinned)

  return (
    <div className="pt-20">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <p className="text-xs font-mono text-primary mb-3">// bulletin_board</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Announcements &amp; <span className="gradient-text">Bulletin</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Stay updated with the latest news, recruitment calls, achievements, and
            announcements from {s.siteName}.
          </p>
        </div>
      </section>

      <section className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-4xl flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                activeCategory === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}>{c}</button>
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-mono text-primary">Pinned Announcements</h2>
              </div>
              <div className="space-y-3">
                {pinned.map(ann => <AnnouncementCard key={ann.id} ann={ann} pinned />)}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-mono text-muted-foreground">All Announcements</h2>
              <span className="text-xs text-muted-foreground ml-auto">{regular.length} items</span>
            </div>
            <div className="space-y-3">
              {regular.length > 0
                ? regular.map(ann => <AnnouncementCard key={ann.id} ann={ann} />)
                : <p className="text-sm text-muted-foreground text-center py-10">No announcements in this category.</p>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function AnnouncementCard({ ann, pinned = false }: { ann: typeof seed[0]; pinned?: boolean }) {
  return (
    <Card className={`p-5 transition-all hover:border-primary/30 ${pinned ? 'border-primary/20 bg-primary/5' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${pinned ? 'bg-primary/20 border border-primary/30' : 'bg-muted border border-border'}`}>
          <Megaphone className={`w-4 h-4 ${pinned ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm leading-tight">{ann.title}</h3>
              {pinned && <Pin className="w-3 h-3 text-primary" />}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`tag ${categoryColors[ann.category] ?? 'tag-cyan'}`}>{ann.category}</span>
              <span className="text-xs font-mono text-muted-foreground">{ann.date}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
          {ann.author && <p className="text-xs text-muted-foreground mt-2">— {ann.author}</p>}
        </div>
      </div>
    </Card>
  )
}

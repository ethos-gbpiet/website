'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { events as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

const statusTabs = ['All', 'Upcoming', 'Ongoing', 'Past']
const categories = ['All', 'Workshop', 'Hackathon', 'Seminar', 'Competition', 'Social']

export default function EventsPage() {
  const s = useSiteSettings()
  const events = useApiData('/api/events', seed)
  const [activeStatus, setActiveStatus] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = events.filter((e: any) => {
    const matchStatus = activeStatus === 'All' || e.status === activeStatus
    const matchCat = activeCategory === 'All' || e.category === activeCategory
    return matchStatus && matchCat
  })

  return (
    <div className="pt-20">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// events_portal</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Events &amp; <span className="gradient-text">Workshops</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Hackathons, workshops, seminars, and competitions — stay up to date with
            everything happening at {s.siteName}.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-7xl flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {statusTabs.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  activeStatus === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeCategory === c
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events list */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-sm font-mono text-muted-foreground mb-6">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="card-hover h-full p-5 group">
                  {/* Status indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant={
                        event.status === 'Upcoming' ? 'default' :
                        event.status === 'Ongoing' ? 'success' : 'outline'
                      }
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                    <span className="tag tag-purple">{event.category}</span>
                  </div>

                  <h2 className="font-display font-semibold text-lg mb-2 leading-tight group-hover:text-primary transition-colors">
                    {event.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-5">{event.description}</p>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono">{event.registrations} / {event.capacity} registered</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mt-4">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (event.registrations / event.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

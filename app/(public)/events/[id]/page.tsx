'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Tag, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { events as seed } from '@/data'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : seed)
      .then((data: any[]) => {
        const found = data.find(e => e.id === id)
        setEvent(found || seed.find(e => e.id === id) || null)
        setLoading(false)
      })
      .catch(() => {
        setEvent(seed.find(e => e.id === id) || null)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Link href="/events">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Events</Button>
        </Link>
      </div>
    </div>
  )

  const pct = event.capacity ? Math.round((event.registrations / event.capacity) * 100) : 0

  return (
    <div className="pt-20 min-h-screen">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <Badge>{event.status}</Badge>
            <Badge variant="outline">{event.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{event.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">{event.description}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {event.longDescription && (
              <Card className="p-6">
                <h2 className="font-display font-bold text-lg mb-3">About this Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.longDescription}</p>
              </Card>
            )}
            {event.schedule?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display font-bold text-lg mb-4">Schedule</h2>
                <div className="space-y-3">
                  {event.schedule.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{item.time}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        {item.speaker && <p className="text-xs text-muted-foreground">{item.speaker}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {event.highlights?.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display font-bold text-lg mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {event.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Event Details</h3>
              <dl className="space-y-3">
                {[
                  { icon: Calendar, label: 'Date',     value: event.date },
                  { icon: Clock,    label: 'Time',     value: event.time },
                  { icon: MapPin,   label: 'Venue',    value: event.venue },
                  { icon: Tag,      label: 'Fee',      value: event.fee },
                  { icon: Users,    label: 'Capacity', value: `${event.registrations ?? 0} / ${event.capacity}` },
                ].filter(d => d.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </dl>
              {event.capacity > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Registrations</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </Card>
            <Link href="/collaborate?type=event">
              <Button variant="glow" className="w-full">Register Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

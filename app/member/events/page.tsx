'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, ExternalLink } from 'lucide-react'
import { EventCard } from '@/components/shared/event-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { events as defaultEvents } from '@/data'
import { getEventRegistrations } from '@/lib/member-data'

export default function MemberEventsPage() {
  const [registeredIds, setRegisteredIds] = useState<string[]>([])

  useEffect(() => {
    setRegisteredIds(getEventRegistrations().map(r => String(r.eventId)))
    const onUpdate = () => setRegisteredIds(getEventRegistrations().map(r => String(r.eventId)))
    window.addEventListener('ethos-member-data-updated', onUpdate)
    return () => window.removeEventListener('ethos-member-data-updated', onUpdate)
  }, [])

  const myEvents = defaultEvents.filter(e => registeredIds.includes(String(e.id)))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// my_registrations</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">My Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Events you've registered for. Updates appear in your notifications.
          </p>
        </div>
        <Button variant="outline-primary" size="sm" asChild>
          <Link href="/events"><ExternalLink className="w-4 h-4 mr-1.5" /> Browse all events</Link>
        </Button>
      </div>

      {myEvents.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No registrations yet"
          description="Register for an upcoming event to see it here."
          action={
            <Button asChild>
              <Link href="/events">Explore events</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}

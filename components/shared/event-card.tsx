import Link from 'next/link'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EventStatusBadge } from '@/components/shared/status-badge'
import { events } from '@/data'

type Event = (typeof events)[0]

interface EventCardProps {
  event: Event
}

/**
 * Reusable event card with date, venue, registration bar.
 * Wraps itself in a Next.js Link to the event detail page.
 */
export function EventCard({ event }: EventCardProps) {
  const capacityPct = Math.min(
    100,
    Math.round((event.registrations / event.capacity) * 100)
  )

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <Card className="card-hover h-full p-5 group flex flex-col">
        {/* Status + category */}
        <div className="flex items-center justify-between mb-4">
          <EventStatusBadge status={event.status} />
          <span className="tag tag-purple">{event.category}</span>
        </div>

        {/* Title */}
        <h2 className="font-display font-semibold text-lg mb-2 leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h2>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
          {event.description}
        </p>

        {/* Meta details */}
        <div className="space-y-2 text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono">
              {event.registrations} / {event.capacity}
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPct >= 90 ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-electric'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

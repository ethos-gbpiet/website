import { Badge } from '@/components/ui/badge'

type ProjectStatus = 'In Progress' | 'Completed' | 'Planning' | string
type EventStatus = 'Upcoming' | 'Ongoing' | 'Past' | string

/** Maps a project status string to the correct Badge variant */
export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus
  className?: string
}) {
  const variant =
    status === 'Completed'
      ? 'success'
      : status === 'In Progress'
      ? 'warning'
      : 'outline'

  return (
    <Badge variant={variant as any} className={className}>
      {status}
    </Badge>
  )
}

/** Maps an event status string to the correct Badge variant */
export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus
  className?: string
}) {
  const variant =
    status === 'Upcoming'
      ? 'default'
      : status === 'Ongoing'
      ? 'success'
      : 'outline'

  return (
    <Badge variant={variant as any} className={className}>
      {status}
    </Badge>
  )
}

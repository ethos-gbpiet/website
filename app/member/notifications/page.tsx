'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BellOff, CheckCheck, ChevronRight, CalendarCheck, FolderGit2, Megaphone, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  relativeTime,
  type Notification,
} from '@/lib/member-data'

const iconFor: Record<Notification['kind'], any> = {
  event: CalendarCheck,
  project: FolderGit2,
  announcement: Megaphone,
  system: Settings,
}

const variantFor: Record<Notification['kind'], 'cyan' | 'purple' | 'orange' | 'outline'> = {
  event: 'cyan',
  project: 'purple',
  announcement: 'orange',
  system: 'outline',
}

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([])

  useEffect(() => {
    setList(getNotifications())
    const onUpdate = () => setList(getNotifications())
    window.addEventListener('ethos-member-data-updated', onUpdate)
    return () => window.removeEventListener('ethos-member-data-updated', onUpdate)
  }, [])

  const unread = list.filter(n => !n.read).length

  function handleMarkAll() {
    markAllNotificationsRead()
    setList(getNotifications())
  }

  function handleClick(id: string) {
    markNotificationRead(id)
    setList(getNotifications())
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// inbox</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Updates on events, projects, and announcements you follow.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You're all caught up"
          description="No notifications yet. We'll let you know when something happens."
        />
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => {
            const Icon = iconFor[n.kind]
            const Wrapper: any = n.href ? Link : 'div'
            const wrapperProps: any = n.href ? { href: n.href } : {}
            return (
              <Wrapper key={n.id} {...wrapperProps} onClick={() => handleClick(n.id)}>
                <Card className={`p-4 flex gap-4 transition-colors hover:border-primary/30 ${
                  !n.read ? 'border-primary/30 bg-primary/5' : ''
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-1">
                      <h3 className="font-semibold text-sm leading-snug flex-1">
                        {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle" />}
                        {n.title}
                      </h3>
                      <Badge variant={variantFor[n.kind]} className="shrink-0">{n.kind}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{n.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">{relativeTime(n.date)}</span>
                      {n.href && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </Card>
              </Wrapper>
            )
          })}
        </div>
      )}
    </div>
  )
}

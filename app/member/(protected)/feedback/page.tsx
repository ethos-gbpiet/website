'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { getFeedbackHistory, relativeTime, type FeedbackEntry } from '@/lib/member-data'

const variantFor: Record<FeedbackEntry['status'], 'outline' | 'info' | 'success'> = {
  received: 'outline',
  reviewed: 'info',
  actioned: 'success',
}

export default function MemberFeedbackPage() {
  const [list, setList] = useState<FeedbackEntry[]>([])

  useEffect(() => {
    setList(getFeedbackHistory())
    const onUpdate = () => setList(getFeedbackHistory())
    window.addEventListener('ethos-member-data-updated', onUpdate)
    return () => window.removeEventListener('ethos-member-data-updated', onUpdate)
  }, [])

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// history</p>
          <h1 className="text-3xl font-display font-bold tracking-tight">Feedback History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you've sent in. We read every message.
          </p>
        </div>
        <Button asChild>
          <Link href="/feedback"><Plus className="w-4 h-4 mr-1.5" /> New feedback</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No feedback yet"
          description="Got a suggestion, idea, or bug to report? Drop us a note from the public feedback page."
          action={
            <Button asChild>
              <Link href="/feedback">Send feedback</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((entry) => (
            <Card key={entry.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <h3 className="font-display font-semibold leading-tight flex-1 min-w-0">{entry.topic}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={variantFor[entry.status]}>{entry.status}</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">{relativeTime(entry.createdAt)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{entry.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

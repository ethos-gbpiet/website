import type { Metadata } from 'next'
import { Star, TrendingUp, ThumbsUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Admin – Feedback' }

// Dummy feedback data for display
const feedbackItems = [
  { id: '1', event: 'Arduino Bootcamp', name: 'Priya Joshi', overall: 5, content: 4, organization: 5, highlights: 'Hands-on component kit was great!', improvements: 'More time for Q&A', recommend: 'yes', date: '2025-02-16' },
  { id: '2', event: 'AI/ML Workshop', name: 'Anonymous', overall: 4, content: 5, organization: 3, highlights: 'Dataset exercises were excellent', improvements: 'Setup instructions were unclear', recommend: 'yes', date: '2025-02-10' },
  { id: '3', event: 'PCB Design Workshop', name: 'Karan Mehta', overall: 3, content: 4, organization: 3, highlights: 'Good introductory content', improvements: 'Lab equipment was insufficient for all students', recommend: 'maybe', date: '2025-01-20' },
  { id: '4', event: 'TechFest 2024 Hackathon', name: 'Riya Singh', overall: 5, content: 5, organization: 5, highlights: 'Amazing atmosphere, great problem statements', improvements: 'Food could be better!', recommend: 'yes', date: '2024-12-10' },
  { id: '5', event: 'Arduino Bootcamp', name: 'Amitabh K', overall: 4, content: 4, organization: 4, highlights: 'Practical focus was perfect', improvements: 'Start time was late by 30 min', recommend: 'yes', date: '2025-02-17' },
]

const avg = (key: 'overall' | 'content' | 'organization') =>
  (feedbackItems.reduce((s, f) => s + f[key], 0) / feedbackItems.length).toFixed(1)

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= value ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )
}

export default function ViewFeedback() {
  const yesCount = feedbackItems.filter((f) => f.recommend === 'yes').length
  const recommendPct = Math.round((yesCount / feedbackItems.length) * 100)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Event Feedback</h1>
        <p className="text-sm text-muted-foreground">Submitted feedback from attendees</p>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-primary">{feedbackItems.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Responses</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-primary">{avg('overall')} ★</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Overall</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-primary">{avg('content')} ★</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Content</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <ThumbsUp className="w-5 h-5 text-primary" />
            <p className="text-3xl font-display font-bold text-primary">{recommendPct}%</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Would Recommend</p>
        </Card>
      </div>

      {/* Feedback cards */}
      <div className="space-y-4">
        {feedbackItems.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{f.date} · {f.event}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`tag ${f.recommend === 'yes' ? 'tag-green' : f.recommend === 'no' ? 'tag-red' : 'tag-orange'}`}>
                  {f.recommend === 'yes' ? 'Recommends' : f.recommend === 'no' ? 'Doesn\'t recommend' : 'Maybe'}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Overall', value: f.overall },
                { label: 'Content', value: f.content },
                { label: 'Organisation', value: f.organization },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <Stars value={value} />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {f.highlights && (
                <div>
                  <p className="text-xs font-mono text-primary mb-1">+ Highlights</p>
                  <p className="text-muted-foreground">{f.highlights}</p>
                </div>
              )}
              {f.improvements && (
                <div>
                  <p className="text-xs font-mono text-orange-400 mb-1">△ Improvements</p>
                  <p className="text-muted-foreground">{f.improvements}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

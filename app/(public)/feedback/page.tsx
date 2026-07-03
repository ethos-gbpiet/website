'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { events as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

type Rating = 0 | 1 | 2 | 3 | 4 | 5

function StarRating({ value, onChange }: { value: Rating; onChange: (v: Rating) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n as Rating)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hovered || value) ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const s = useSiteSettings()
  const events = useApiData('/api/events', seed)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    eventId: '',
    name: '',
    email: '',
    overallRating: 0 as Rating,
    contentRating: 0 as Rating,
    organizationRating: 0 as Rating,
    highlights: '',
    improvements: '',
    recommend: '' as '' | 'yes' | 'no' | 'maybe',
    comments: '',
  })

  const pastEvents = events.filter((e) => e.status === 'Past')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production: POST to API
    console.log('Feedback submitted:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your feedback has been submitted. It helps us make every {s.siteName} event better than the last.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// feedback_portal</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Share Your <span className="gradient-text">Feedback</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Attended a {s.siteName} event? Let us know what worked, what didn't, and how we can make the next one even better.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event selector */}
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-4">Which event are you reviewing?</h2>
              <select
                required
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select an event…</option>
                {pastEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </Card>

            {/* Personal info */}
            <Card className="p-6 space-y-4">
              <h2 className="font-display font-semibold">Your Info <span className="text-muted-foreground text-xs font-sans font-normal">(optional)</span></h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="Arjun Mehta"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@iet.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </Card>

            {/* Ratings */}
            <Card className="p-6 space-y-5">
              <h2 className="font-display font-semibold">Ratings</h2>
              {[
                { label: 'Overall Experience', key: 'overallRating' },
                { label: 'Content Quality', key: 'contentRating' },
                { label: 'Organisation & Logistics', key: 'organizationRating' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm text-muted-foreground mb-2">{label}</label>
                  <StarRating
                    value={form[key as keyof typeof form] as Rating}
                    onChange={(v) => setForm({ ...form, [key]: v })}
                  />
                </div>
              ))}
            </Card>

            {/* Written feedback */}
            <Card className="p-6 space-y-4">
              <h2 className="font-display font-semibold">Tell Us More</h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">What did you enjoy most?</label>
                <textarea
                  rows={3}
                  placeholder="The hands-on PCB soldering was excellent…"
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">What could be improved?</label>
                <textarea
                  rows={3}
                  placeholder="The venue was a bit crowded…"
                  value={form.improvements}
                  onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Additional comments</label>
                <textarea
                  rows={2}
                  placeholder="Anything else you'd like to share…"
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </Card>

            {/* Recommend */}
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-4">Would you recommend {s.siteName} events?</h2>
              <div className="flex gap-3">
                {(['yes', 'no', 'maybe'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, recommend: opt })}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all border ${
                      form.recommend === opt
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </Card>

            <Button type="submit" size="lg" variant="glow" className="w-full gap-2">
              <Send className="w-4 h-4" /> Submit Feedback
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

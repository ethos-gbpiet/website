import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Admin – Collaboration Requests' }

const requests = [
  { id: '1', name: 'Tanvi Mehta', email: 'tanvi@iet.edu', type: 'join', domain: 'ROS2, Python, Embedded C', year: '2nd Year, ECE', message: 'Interested in joining the Drone project.', status: 'pending', date: '2025-03-17' },
  { id: '2', name: 'Siddharth Rao', email: 'sidd@iet.edu', type: 'propose', domain: 'ML, TensorFlow, OpenCV', year: '3rd Year, CS', message: 'Want to propose an ASL recognition glove project.', status: 'pending', date: '2025-03-15' },
  { id: '3', name: 'Kiran Electronics Pvt Ltd', email: 'hr@kiran.in', type: 'sponsor', domain: 'Power Electronics', year: '—', message: 'Interested in sponsoring the upcoming soldering workshop.', status: 'reviewing', date: '2025-03-10' },
  { id: '4', name: 'Dr. Anil Sharma (IIT-R)', email: 'anil@iitr.ac.in', type: 'mentor', domain: 'Robotics, Controls', year: 'Alumni', message: 'Happy to mentor the autonomous vehicle team once a week.', status: 'accepted', date: '2025-03-02' },
  { id: '5', name: 'Megha Kapoor', email: 'megha@iet.edu', type: 'join', domain: 'Web, React, Node.js', year: '1st Year, IT', message: 'Want to contribute to the society website.', status: 'rejected', date: '2025-02-28' },
]

const typeLabel: Record<string, string> = {
  join: 'Join Project', propose: 'Propose Project', sponsor: 'Sponsorship', mentor: 'Mentor',
}

const statusVariant = (s: string) =>
  s === 'accepted' ? 'success' : s === 'rejected' ? 'red' : s === 'reviewing' ? 'warning' : 'outline'

export default function CollaborationRequests() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Collaboration Requests</h1>
        <p className="text-sm text-muted-foreground">Review incoming collaboration and partnership requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: requests.length },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length },
          { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length },
          { label: 'Reviewing', value: requests.filter(r => r.status === 'reviewing').length },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{r.email} · {r.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="tag tag-cyan">{typeLabel[r.type]}</span>
                <Badge variant={statusVariant(r.status)} className="text-xs capitalize">{r.status}</Badge>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Year / Org</p>
                <p>{r.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Skills / Domain</p>
                <p>{r.domain}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 italic">"{r.message}"</p>

            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs hover:bg-primary/20 transition-colors">
                  Accept
                </button>
                <button className="px-4 py-1.5 rounded-md bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Mark for Review
                </button>
                <button className="px-4 py-1.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs hover:bg-destructive/20 transition-colors ml-auto">
                  Reject
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

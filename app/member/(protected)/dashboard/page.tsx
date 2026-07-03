'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Send, CheckCircle, Clock, XCircle, ArrowRight, FileText, Megaphone, CalendarDays, BookOpen } from 'lucide-react'

interface MemberSession {
  id: string; name: string; username: string; role: string
  domain: string; year: string; email: string
}

interface Submission {
  id: string; type: string; title: string; status: string; submittedAt: string; memberId?: string
}

function getSession(): MemberSession | null {
  try { const r = sessionStorage.getItem('ethos_member'); return r ? JSON.parse(r) : null } catch { return null }
}

const statusIcon = {
  pending:  { icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' },
  approved: { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  rejected: { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
}

const typeIcon: Record<string, React.ElementType> = {
  announcement:   Megaphone,
  'project-update': FileText,
  event:          CalendarDays,
  resource:       BookOpen,
}

const quickActions = [
  { href: '/member/submit?type=announcement',    icon: Megaphone,    label: 'Post Announcement', color: 'bg-cyan-400/10 border-cyan-400/20 hover:bg-cyan-400/15' },
  { href: '/member/submit?type=project-update',  icon: FileText,     label: 'Project Update',   color: 'bg-violet-400/10 border-violet-400/20 hover:bg-violet-400/15' },
  { href: '/member/submit?type=event',           icon: CalendarDays, label: 'Propose Event',    color: 'bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/15' },
  { href: '/member/submit?type=resource',        icon: BookOpen,     label: 'Share Resource',   color: 'bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/15' },
]

export default function MemberDashboard() {
  const [member, setMember] = useState<MemberSession | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const s = getSession()
    setMember(s)
    if (s) {
      fetch('/api/submissions', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : [])
        .then((all: Submission[]) => setSubmissions(all.filter(x => x.memberId === s.id)))
        .catch(() => {})
    }
  }, [])

  const pending  = submissions.filter(s => s.status === 'pending').length
  const approved = submissions.filter(s => s.status === 'approved').length
  const rejected = submissions.filter(s => s.status === 'rejected').length

  if (!member) return null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome back, {member.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {member.role} · {member.year} · {member.domain}
          </p>
        </div>
        <Link href="/member/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm hover:bg-muted transition-colors">
          <User className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review',   count: pending,  color: 'text-amber-400' },
          { label: 'Approved',         count: approved, color: 'text-emerald-400' },
          { label: 'Total Submitted',  count: submissions.length, color: 'text-primary' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5 text-center">
            <p className={`text-3xl font-display font-bold ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Submit Content
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-xl border text-center transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 ${color}`}>
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Submissions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            My Submissions
          </h2>
          <Link href="/member/submit" className="text-xs text-primary hover:underline flex items-center gap-1">
            Submit new <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Send className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Use the quick actions above to submit content for the website.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 8).map(sub => {
              const { icon: StatusIcon, color, bg } = statusIcon[sub.status as keyof typeof statusIcon] || statusIcon.pending
              const TypeIcon = typeIcon[sub.type] || FileText
              return (
                <div key={sub.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{sub.type} · {sub.submittedAt}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${bg} ${color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sub.status}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

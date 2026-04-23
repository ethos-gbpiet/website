'use client'

import Link from 'next/link'
import {
  FolderKanban, CalendarDays, Megaphone, MessageSquare,
  Handshake, Users, ArrowRight, Activity, CheckCircle, Clock, Settings,
  Send, UserCheck
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApiData } from '@/lib/use-api-data'
import { projects as seedP, events as seedE, announcements as seedA } from '@/data'

export default function AdminDashboard() {
  const projects      = useApiData<any[]>('/api/projects',     seedP)
  const events        = useApiData<any[]>('/api/events',       seedE)
  const announcements = useApiData<any[]>('/api/announcements', seedA)
  const team          = useApiData<any[]>('/api/team',         [])
  const submissions   = useApiData<any[]>('/api/submissions',  [])
  const members       = useApiData<any[]>('/api/members?action=list', [])

  const inProgress      = projects.filter((p: any) => p.status === 'In Progress').length
  const upcoming        = events.filter((e: any) => e.status === 'Upcoming' || e.status === 'Flagship').length
  const pinned          = announcements.filter((a: any) => a.pinned).length
  const nextEvent       = events.find((e: any) => e.status === 'Upcoming' || e.status === 'Flagship')
  const pendingSubs     = submissions.filter((s: any) => s.status === 'pending').length
  const pendingMembers  = members.filter((m: any) => !m.approved).length

  const summaryCards = [
    { label: 'Active Projects',    value: inProgress,          icon: FolderKanban, sub: `${projects.length} total`,        color: 'text-cyan-400',    href: '/admin/projects' },
    { label: 'Upcoming Events',    value: upcoming,             icon: CalendarDays,  sub: nextEvent ? nextEvent.date : '—', color: 'text-violet-400',  href: '/admin/events' },
    { label: 'Announcements',      value: announcements.length, icon: Megaphone,     sub: `${pinned} pinned`,               color: 'text-amber-400',   href: '/admin/announcements' },
    { label: 'Team Members',       value: team.length,          icon: Users,         sub: 'across all sections',            color: 'text-emerald-400', href: '/admin/team' },
    { label: 'Pending Submissions', value: pendingSubs,          icon: Send,         sub: `${submissions.length} total`,    color: 'text-pink-400',    href: '/admin/submissions' },
    { label: 'Member Accounts',    value: members.length,       icon: UserCheck,     sub: `${pendingMembers} awaiting approval`, color: 'text-orange-400', href: '/admin/members' },
  ]

  const quickLinks = [
    { label: 'Site Settings',    href: '/admin/settings',     icon: Settings,     desc: 'Edit hero, contact, social links' },
    { label: 'Team Members',     href: '/admin/team',         icon: Users,        desc: 'Add, edit, or remove members' },
    { label: 'Submissions',      href: '/admin/submissions',  icon: Send,         desc: `Review ${pendingSubs} pending items` },
    { label: 'Member Accounts',  href: '/admin/members',      icon: UserCheck,    desc: `${pendingMembers} pending approval` },
    { label: 'Projects',         href: '/admin/projects',     icon: FolderKanban, desc: 'Update project status and details' },
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, Admin. Here&apos;s what&apos;s happening with EtHOS.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, sub, color, href }) => (
          <Link key={label} href={href}>
            <Card className="p-5 hover:border-primary/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground/60 font-mono mt-1">{sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Recent Projects</h2>
            <Link href="/admin/projects" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <Card className="divide-y divide-border overflow-hidden">
            {projects.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress ?? 0}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{p.progress ?? 0}%</span>
                  <Badge variant={p.status === 'Completed' ? 'success' : p.status === 'In Progress' ? 'warning' : 'outline'}
                    className="text-[10px]">{p.status}</Badge>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No projects yet.</p>}
          </Card>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            {quickLinks.map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Upcoming events */}
          <h2 className="font-display font-semibold pt-2">Upcoming Events</h2>
          <div className="space-y-2">
            {events.filter((e: any) => e.status === 'Upcoming' || e.status === 'Flagship').slice(0, 3).map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold leading-none">{(ev.date || '').split(' ')[0] || '—'}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{(ev.date || '').split(' ')[1] || ''}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{ev.venue}</p>
                </div>
              </div>
            ))}
            {events.filter((e: any) => e.status === 'Upcoming' || e.status === 'Flagship').length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No upcoming events.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

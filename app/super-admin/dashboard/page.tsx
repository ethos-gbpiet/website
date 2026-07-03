import { Suspense } from 'react'
import Link from 'next/link'
import { Users, Shield, Crown, Activity, FolderKanban, CalendarDays, Megaphone, Users2, Mail, ArrowRight, TrendingUp, GraduationCap } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/client'
import { users, projects, events, announcements, inboxItems, teamMembers, activityLogs, memberProfiles } from '@/lib/db/schema'
import { sql, desc, eq, isNotNull } from 'drizzle-orm'

async function Stats() {
  const user = await getCurrentUser()
  const [
    [userCount], [projectCount], [eventCount], [announcementCount],
    [inboxCount], [teamCount],
    recentActivity,
    roleCounts,
    [assignedCount],
    [myApprenticeCount],
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users),
    db.select({ c: sql<number>`count(*)::int` }).from(projects),
    db.select({ c: sql<number>`count(*)::int` }).from(events),
    db.select({ c: sql<number>`count(*)::int` }).from(announcements),
    db.select({ c: sql<number>`count(*)::int` }).from(inboxItems),
    db.select({ c: sql<number>`count(*)::int` }).from(teamMembers),
    db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(8),
    db.select({ role: users.role, c: sql<number>`count(*)::int` }).from(users).groupBy(users.role),
    db.select({ c: sql<number>`count(*)::int` }).from(memberProfiles).where(isNotNull(memberProfiles.mentorId)),
    user ? db.select({ c: sql<number>`count(*)::int` }).from(memberProfiles).where(eq(memberProfiles.mentorId, user.id)) : Promise.resolve([{ c: 0 }]),
  ])

  const statCards = [
    { label: 'Total Users',      value: userCount.c,        icon: Users,        color: 'text-cyan-400',   bg: 'bg-cyan-500/8',   href: '/super-admin/users' },
    { label: 'Projects',         value: projectCount.c,     icon: FolderKanban, color: 'text-violet-400', bg: 'bg-violet-500/8', href: '/admin/projects' },
    { label: 'Events',           value: eventCount.c,       icon: CalendarDays, color: 'text-amber-400',  bg: 'bg-amber-500/8',  href: '/admin/events' },
    { label: 'Announcements',    value: announcementCount.c,icon: Megaphone,    color: 'text-emerald-400',bg: 'bg-emerald-500/8',href: '/admin/announcements' },
    { label: 'Team Members',     value: teamCount.c,        icon: Users2,       color: 'text-pink-400',   bg: 'bg-pink-500/8',   href: '/super-admin/team' },
    { label: 'My Apprentices',   value: myApprenticeCount.c,icon: GraduationCap,color: 'text-sky-400',    bg: 'bg-sky-500/8',    href: '/super-admin/apprentices' },
  ]

  const roleMap = Object.fromEntries(roleCounts.map(r => [r.role, r.c]))

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="group bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all hover:shadow-md">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Role breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-semibold text-sm">Users by Role</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { role: 'super_admin', label: 'Super Admin', color: 'bg-amber-400' },
              { role: 'admin',       label: 'Admin',       color: 'bg-purple-400' },
              { role: 'faculty',     label: 'Faculty',     color: 'bg-emerald-400' },
              { role: 'creator',     label: 'Creator',     color: 'bg-violet-400' },
              { role: 'user',        label: 'Member',      color: 'bg-cyan-400' },
            ].map(({ role, label, color }) => {
              const count = roleMap[role] ?? 0
              const pct = userCount.c > 0 ? Math.round((count / userCount.c) * 100) : 0
              return (
                <div key={role} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-semibold text-sm">Recent Activity</h3>
            </div>
            <Link href="/super-admin/activity" className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex items-start gap-2.5 py-1.5 border-b border-border/50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs truncate">{log.action}</p>
                    {log.target && <p className="text-[10px] text-muted-foreground truncate">{log.target}</p>}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-auto">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ New User',           href: '/super-admin/users?action=create' },
            { label: '+ New Admin',          href: '/super-admin/users?action=create&role=admin' },
            { label: 'Mark Attendance',      href: '/super-admin/attendance' },
            { label: `Apprentices (${assignedCount.c} assigned)`, href: '/super-admin/apprentices' },
            { label: 'Edit Team',            href: '/super-admin/team' },
            { label: 'Site Settings',        href: '/super-admin/settings' },
            { label: 'Manage Permissions',   href: '/super-admin/permissions' },
            { label: 'Reset a Password',     href: '/super-admin/passwords' },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 text-xs font-mono border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function SuperAdminDashboard() {
  const user = await getCurrentUser()
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-amber-400/80">// super_admin</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.name}. Here's the full platform overview.
        </p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading stats…</div>}>
        <Stats />
      </Suspense>
    </div>
  )
}

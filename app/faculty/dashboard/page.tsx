import { Suspense } from 'react'
import Link from 'next/link'
import { GraduationCap, Users, ClipboardList, Mail, TrendingUp, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/client'
import { users, attendanceRecords, inboxItems } from '@/lib/db/schema'
import { sql, eq, and, desc } from 'drizzle-orm'

async function FacultyStats() {
  const today = new Date().toISOString().slice(0, 10)
  const [memberCountRows, presentTodayRows, inboxCountRows, recentAttendance] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users).where(eq(users.role, 'user')),
    db.select({ c: sql<number>`count(*)::int` }).from(attendanceRecords)
      .where(and(eq(attendanceRecords.date, today), eq(attendanceRecords.status, 'present'))),
    db.select({ c: sql<number>`count(*)::int` }).from(inboxItems).where(eq(inboxItems.status, 'new')),
    db.select().from(attendanceRecords).orderBy(desc(attendanceRecords.updatedAt)).limit(5),
  ])

  const memberCount = memberCountRows[0]?.c ?? 0
  const presentToday = presentTodayRows[0]?.c ?? 0
  const inboxCount = inboxCountRows[0]?.c ?? 0

  const stats = [
    { label: 'Total Members', value: memberCount, icon: Users,        color: 'text-cyan-400',   href: '/faculty/members' },
    { label: 'Present Today', value: presentToday, icon: ClipboardList,color: 'text-emerald-400',href: '/faculty/attendance' },
    { label: 'New Inbox',     value: inboxCount,   icon: Mail,         color: 'text-amber-400',  href: '/faculty/inbox' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" /> Recent Attendance
          </h3>
          <Link href="/faculty/attendance" className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
            Full report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentAttendance.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No attendance records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-mono text-muted-foreground border-b border-border">
                <th className="text-left pb-2">Date</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-right pb-2">Work Hrs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentAttendance.map(r => (
                <tr key={r.id}>
                  <td className="py-2 font-mono text-xs">{r.date}</td>
                  <td className="py-2">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      r.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      r.status === 'absent'  ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-2 text-right text-xs font-mono">{r.workHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'View All Members',       href: '/faculty/members' },
            { label: 'Attendance Reports',     href: '/faculty/attendance' },
            { label: 'View Inbox',             href: '/faculty/inbox' },
            { label: 'Platform Analytics',     href: '/faculty/analytics' },
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

export default async function FacultyDashboard() {
  const user = await getCurrentUser()
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400/80">// faculty_coordinator</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Faculty Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.name}. Platform oversight and member reports.</p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <FacultyStats />
      </Suspense>
    </div>
  )
}

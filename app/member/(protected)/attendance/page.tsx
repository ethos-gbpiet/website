'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, CalendarDays, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AttendanceRecord {
  id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'leave'
  workHours: number
  notes?: string
}

interface Stats {
  totalDays: number
  present: number
  late: number
  absent: number
  onLeave: number
  totalHours: number
  monthly: Record<string, { hours: number; days: number }>
}

const STATUS = {
  present: { label: 'Present',  icon: CheckCircle,    cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  late:    { label: 'Late',     icon: AlertTriangle,  cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  absent:  { label: 'Absent',   icon: XCircle,        cls: 'bg-red-400/10 text-red-400 border-red-400/20' },
  leave:   { label: 'On Leave', icon: CalendarDays,   cls: 'bg-violet-400/10 text-violet-400 border-violet-400/20' },
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function MemberAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats]     = useState<Stats | null>(null)
  const [month, setMonth]     = useState(currentMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/attendance?month=${month}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch('/api/attendance/stats', { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([recs, st]) => {
      setRecords(Array.isArray(recs) ? recs : [])
      setStats(st)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [month])

  const attendanceRate = stats && stats.totalDays > 0
    ? Math.round(((stats.present + stats.late) / stats.totalDays) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold">My Attendance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your work hours and attendance records
        </p>
      </div>

      {/* Overall stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Hours',     value: `${stats.totalHours}h`,   color: 'text-primary',      icon: Clock },
            { label: 'Days Present',    value: stats.present + stats.late, color: 'text-emerald-400', icon: CheckCircle },
            { label: 'Days Absent',     value: stats.absent,              color: 'text-red-400',      icon: XCircle },
            { label: 'Attendance Rate', value: `${attendanceRate}%`,      color: 'text-violet-400',   icon: TrendingUp },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="p-5 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Monthly breakdown */}
      {stats && Object.keys(stats.monthly).length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
            // monthly_breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats.monthly)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([m, d]) => (
                <div key={m} className="bg-muted rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">{monthLabel(m)}</p>
                    <p className="font-display font-bold text-primary">{d.hours}h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{d.days} days</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Month navigator + records */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            // attendance_log
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth(prevMonth(month))}
              className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-mono font-medium min-w-[130px] text-center">
              {monthLabel(month)}
            </span>
            <button onClick={() => setMonth(nextMonth(month))}
              disabled={month >= currentMonth()}
              className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
        ) : records.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground opacity-40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No attendance records for {monthLabel(month)}.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Records are marked by your admin or faculty coordinator.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Hours</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map(r => {
                  const s = STATUS[r.status]
                  const Icon = s.icon
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{fmtDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${s.cls}`}>
                          <Icon className="w-3 h-3" />{s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-primary">{r.workHours}h</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{r.notes || '—'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}

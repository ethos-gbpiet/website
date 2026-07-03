'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Clock, Users, TrendingUp, RefreshCw, Search, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Member {
  id: string; name: string; email: string; role?: string
  totalHours: number; present: number; late: number; totalDays: number
}

interface AttendanceRecord {
  id: number; memberId: string; date: string
  status: 'present' | 'absent' | 'late' | 'leave'; workHours: number; notes?: string
}

const STATUS_OPTIONS: { value: 'present' | 'absent' | 'late' | 'leave'; label: string; cls: string }[] = [
  { value: 'present', label: 'Present',  cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/20' },
  { value: 'late',    label: 'Late',     cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20 hover:bg-amber-400/20' },
  { value: 'absent',  label: 'Absent',   cls: 'bg-red-400/10 text-red-400 border-red-400/20 hover:bg-red-400/20' },
  { value: 'leave',   label: 'On Leave', cls: 'bg-violet-400/10 text-violet-400 border-violet-400/20 hover:bg-violet-400/20' },
]

const STATUS_BADGE: Record<string, string> = {
  present: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  late:    'bg-amber-400/10 text-amber-400 border-amber-400/20',
  absent:  'bg-red-400/10 text-red-400 border-red-400/20',
  leave:   'bg-violet-400/10 text-violet-400 border-violet-400/20',
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
function today() {
  return new Date().toISOString().split('T')[0]
}

interface AttendanceConsoleProps {
  title?: string
  subtitle?: string
  memberLabel?: string
  emptyStateHint?: string
}

export function AttendanceConsole({
  title = 'Attendance & Work Hours',
  subtitle = 'Mark attendance, track hours, view leaderboard',
  memberLabel = 'Members',
  emptyStateHint = 'No members found.',
}: AttendanceConsoleProps) {
  const [members, setMembers]         = useState<Member[]>([])
  const [records, setRecords]         = useState<AttendanceRecord[]>([])
  const [search, setSearch]           = useState('')
  const [month, setMonth]             = useState(currentMonth())
  const [selectedDate, setSelectedDate] = useState(today())
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState<string | null>(null)
  const [saved, setSaved]             = useState(false)
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)
  const [view, setView]               = useState<'mark' | 'history' | 'leaderboard'>('mark')

  const [markStatus, setMarkStatus]   = useState<'present' | 'absent' | 'late' | 'leave'>('present')
  const [markHours, setMarkHours]     = useState(4)
  const [markNotes, setMarkNotes]     = useState('')

  const [leaders, setLeaders]         = useState<any[]>([])

  const loadMembers = useCallback(() => {
    setLoading(true)
    fetch('/api/attendance/stats?all=true', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const loadRecords = useCallback((targetMonth: string) => {
    fetch(`/api/attendance?month=${targetMonth}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setRecords(Array.isArray(d) ? d : []))
  }, [])

  const loadLeaderboard = useCallback(() => {
    fetch('/api/attendance/leaderboard?limit=10', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setLeaders(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])
  useEffect(() => { loadRecords(month) }, [month, loadRecords])
  useEffect(() => { if (view === 'leaderboard') loadLeaderboard() }, [view, loadLeaderboard])

  async function markAttendance(memberId: string) {
    setSaving(memberId)
    setErrorMsg(null)
    const r = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, date: selectedDate, status: markStatus, workHours: markHours, notes: markNotes }),
    })
    setSaving(null)
    if (!r.ok) {
      const data = await r.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Could not save attendance.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadMembers()
    loadRecords(month)
  }

  const totalHoursAll  = members.reduce((s, m) => s + m.totalHours, 0)
  const totalPresent   = members.reduce((s, m) => s + m.present + m.late, 0)
  const filtered       = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-md">
              ✓ Saved
            </span>
          )}
          <button onClick={loadMembers} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: memberLabel,  value: members.length,  color: 'text-primary',      icon: Users },
          { label: 'Total Hours',    value: `${totalHoursAll}h`, color: 'text-cyan-400', icon: Clock },
          { label: 'Days Attended',  value: totalPresent,    color: 'text-emerald-400',  icon: CheckCircle },
          { label: 'Avg Hours/Member', value: members.length ? `${Math.round(totalHoursAll / members.length)}h` : '0h', color: 'text-violet-400', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="p-5 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-1.5 bg-muted/50 border border-border rounded-lg p-1 w-fit">
        {([
          { key: 'mark',        label: 'Mark Attendance' },
          { key: 'history',     label: 'History' },
          { key: 'leaderboard', label: 'Leaderboard' },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setView(key)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors ${
              view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Mark Attendance ─────────────────────────────────────────────────── */}
      {view === 'mark' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search member…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <input type="date" value={selectedDate} max={today()}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <Card className="p-5">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">// mark_settings</p>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setMarkStatus(s.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                      markStatus === s.value ? s.cls : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-muted-foreground font-mono">Hours:</label>
                <input type="number" min={0} max={12} value={markHours}
                  onChange={e => setMarkHours(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 bg-muted border border-border rounded-md text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <input type="text" placeholder="Note (optional)" value={markNotes}
                onChange={e => setMarkNotes(e.target.value)}
                className="px-3 py-1.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-48" />
            </div>
          </Card>

          {loading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
          ) : (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Member</th>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">Total Hours</th>
                    <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Days Present</th>
                    <th className="text-right px-4 py-3 font-mono text-xs text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.email}{m.role === 'creator' ? ' · Creator' : ''}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-mono font-bold text-primary">{m.totalHours}h</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm">{m.present + m.late} days</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => markAttendance(m.id)}
                          disabled={saving === m.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono hover:bg-primary/20 transition-colors disabled:opacity-50">
                          {saving === m.id ? 'Saving…' : `Mark ${markStatus}`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <p className="text-center py-12 text-sm text-muted-foreground">{emptyStateHint}</p>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── History ─────────────────────────────────────────────────────────── */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Filter by member…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
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

          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground">Hours</th>
                  <th className="text-left px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records
                  .filter(r => {
                    if (!search) return true
                    const m = members.find(x => x.id === r.memberId)
                    return m?.name.toLowerCase().includes(search.toLowerCase())
                  })
                  .map(r => {
                    const member = members.find(m => m.id === r.memberId)
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">{member?.name ?? r.memberId.slice(0, 8)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_BADGE[r.status] ?? ''}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-primary">{r.workHours}h</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{r.notes || '—'}</span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
            {records.length === 0 && (
              <p className="text-center py-12 text-sm text-muted-foreground">No records for {monthLabel(month)}.</p>
            )}
          </Card>
        </div>
      )}

      {/* ── Leaderboard ─────────────────────────────────────────────────────── */}
      {view === 'leaderboard' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="font-display font-semibold">Work Hours Leaderboard</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Top members by total logged work hours</p>
          </div>
          {leaders.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">No data yet. Mark some attendance to populate the leaderboard.</p>
          ) : (
            <div className="divide-y divide-border">
              {leaders.map((l, i) => (
                <div key={l.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                    i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                    i === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                              'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{l.present} days present</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary text-lg">{l.totalHours}h</p>
                    <p className="text-xs text-muted-foreground">total hours</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

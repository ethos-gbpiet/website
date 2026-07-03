import { Activity, Clock } from 'lucide-react'
import { db } from '@/lib/db/client'
import { activityLogs, users } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export default async function ActivityLogsPage() {
  const logs = await db
    .select({
      id:        activityLogs.id,
      action:    activityLogs.action,
      target:    activityLogs.target,
      meta:      activityLogs.meta,
      createdAt: activityLogs.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.actorId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(200)

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-muted-foreground">// platform.activity_logs</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Audit trail of all admin and system actions.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Timestamp', 'Actor', 'Action', 'Target'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {log.actorName ? (
                        <div>
                          <p className="text-xs font-medium">{log.actorName}</p>
                          <p className="text-[11px] text-muted-foreground">{log.actorEmail}</p>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">System</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-foreground">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.target ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

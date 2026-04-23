import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  label: string
  className?: string
  render: (row: T) => React.ReactNode
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
}

/**
 * Generic table component used across all admin management pages.
 * Handles empty state, consistent header styling, and row hover.
 */
export function AdminTable<T>({
  columns,
  data,
  keyField,
  emptyMessage = 'No data found.',
}: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left px-4 py-3 font-mono text-xs text-muted-foreground',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <p className="text-center py-16 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </div>
  )
}

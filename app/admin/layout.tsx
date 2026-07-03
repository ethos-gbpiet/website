import { requireRole } from '@/lib/auth/server'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('admin')

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar user={{ name: user.name, role: user.role }} />
      <div className="flex-1 ml-60 min-w-0">
        <main className="min-h-screen p-6 md:p-8 page-transition">{children}</main>
      </div>
    </div>
  )
}

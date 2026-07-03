import { requireRole } from '@/lib/auth/server'
import { SuperAdminSidebar } from '@/components/layout/super-admin-sidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('super_admin')
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SuperAdminSidebar user={{ name: user.name, email: user.email }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

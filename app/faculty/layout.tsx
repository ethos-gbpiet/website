import { requireRole } from '@/lib/auth/server'
import { FacultySidebar } from '@/components/layout/faculty-sidebar'

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('faculty')
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <FacultySidebar user={{ name: user.name, email: user.email }} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

import { requireRole } from '@/lib/auth/server'
import { MemberSidebar } from '@/components/layout/member-sidebar'

export default async function MemberProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('user')

  return (
    <MemberSidebar user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
      {children}
    </MemberSidebar>
  )
}

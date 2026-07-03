import { requireRole } from '@/lib/auth/server'
import { CreatorSidebar } from '@/components/layout/creator-sidebar'

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('creator')
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CreatorSidebar user={{ name: user.name, email: user.email }} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

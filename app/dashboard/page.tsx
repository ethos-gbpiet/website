// Smart role-based redirect. All portals point here after login.
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { defaultPortal } from '@/lib/permissions'

export default async function DashboardRedirect() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  redirect(defaultPortal(user.role))
}

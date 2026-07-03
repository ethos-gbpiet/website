// Redirect legacy member login URL to unified login
import { redirect } from 'next/navigation'
export default function MemberLoginLegacy() {
  redirect('/login')
}

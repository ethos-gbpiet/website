// Redirect legacy admin login URL to unified login
import { redirect } from 'next/navigation'
export default function AdminLoginLegacy() {
  redirect('/login')
}

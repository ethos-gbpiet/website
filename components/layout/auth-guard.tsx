'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthed } from '@/lib/store'

/**
 * Wraps every admin page. If the user is not authenticated it redirects
 * to /admin/login. The login page itself is excluded from the check.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Skip guard on the login page itself
    if (pathname === '/admin/login') {
      setReady(true)
      return
    }
    if (!isAuthed()) {
      router.replace('/admin/login')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

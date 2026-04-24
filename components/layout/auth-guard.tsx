'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser, hasRole, type Role } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  /** Minimum role required. Defaults to `user` (any signed-in account). */
  role?: Role
  /** Where to redirect if the user is not authorized. */
  fallback?: string
  /** Pathnames within this guarded section that should be skipped (e.g. login pages). */
  publicPaths?: string[]
}

/**
 * Role-aware guard. Wraps admin / member pages. If the user is not
 * authenticated (or doesn't meet the required role) they are redirected
 * to the fallback. Login pages can be excluded via `publicPaths`.
 */
export default function AuthGuard({
  children,
  role = 'user',
  fallback,
  publicPaths = [],
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (publicPaths.includes(pathname)) {
      setReady(true)
      return
    }
    const user = getCurrentUser()
    const target = fallback ?? (role === 'admin' || role === 'super_admin' ? '/admin/login' : '/member/login')

    if (!user) {
      router.replace(target)
      return
    }
    if (!hasRole(role)) {
      // Signed in, but wrong role — bounce to their own dashboard
      router.replace(user.role === 'user' ? '/member/dashboard' : '/admin/dashboard')
      return
    }
    setReady(true)
  }, [pathname, router, role, fallback, publicPaths])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">// authenticating</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

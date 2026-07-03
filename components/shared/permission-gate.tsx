'use client'

import { useSession } from 'next-auth/react'
import { type Capability, type Role, can, hasRole } from '@/lib/permissions'
import type { AdminPermissions } from '@/lib/db/schema'

interface PermissionGateProps {
  /** Minimum role required, e.g. "admin". Mutually exclusive with `capability`. */
  role?: Role
  /** Specific capability required. Server should also enforce it. */
  capability?: Capability
  /** Granular permission row for the current admin (fetched server-side). */
  perms?: Partial<AdminPermissions> | null
  /** What to render when the user does NOT have access (default: nothing). */
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Client-side capability gate. Use for hiding admin actions from the UI.
 *
 * IMPORTANT: never use this as your only enforcement — always re-check
 * permissions on the server side in API routes / server actions.
 */
export function PermissionGate({ role, capability, perms, fallback = null, children }: PermissionGateProps) {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as Role | undefined

  const allowed = capability
    ? can(userRole, capability, perms)
    : role
      ? hasRole(userRole, role)
      : false

  return <>{allowed ? children : fallback}</>
}

// ─── Server-side auth helpers ───────────────────────────────────────────────
// Use in server components, server actions, and API route handlers.

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { authOptions } from './options'
import { db } from '@/lib/db/client'
import { adminPermissions } from '@/lib/db/schema'
import { type Role, hasRole, can, defaultPortal, type Capability } from '@/lib/permissions'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const s = await getSession()
  if (!s?.user) return null
  return s.user as unknown as SessionUser
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser()
  if (!u) redirect('/login')
  return u
}

export async function requireRole(min: Role): Promise<SessionUser> {
  const u = await getCurrentUser()
  if (!u) redirect('/login')
  if (!hasRole(u.role, min)) {
    // Signed in but wrong role — send them to their own portal
    redirect(defaultPortal(u.role))
  }
  return u
}

/** Read the granular admin permissions row for a user (or null). */
export async function getAdminPermissions(userId: string) {
  const rows = await db.select().from(adminPermissions).where(eq(adminPermissions.userId, userId)).limit(1)
  return rows[0] ?? null
}

/** Server-side capability gate — reads the perms row when the user is an admin. */
export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const u = await requireUser()
  const perms = u.role === 'admin' ? await getAdminPermissions(u.id) : null
  if (!can(u.role, capability, perms)) {
    redirect(defaultPortal(u.role))
  }
  return u
}

/** Same as requireCapability but returns boolean (no redirect) — for conditional UI. */
export async function hasCapability(capability: Capability): Promise<boolean> {
  const u = await getCurrentUser()
  if (!u) return false
  const perms = u.role === 'admin' ? await getAdminPermissions(u.id) : null
  return can(u.role, capability, perms)
}

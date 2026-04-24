// ─── EtHOS unified auth + roles ──────────────────────────────────────────────
// Lightweight client-side auth used by AuthGuard, navbar, and the admin /
// member layouts. Backed by sessionStorage so the session ends when the tab
// closes. In production swap for NextAuth/JWT — the public API here stays.

export type Role = 'visitor' | 'user' | 'admin' | 'super_admin'

export interface SessionUser {
  id: string
  name: string
  email?: string
  username?: string
  role: Role
  // Extra member fields (only present for `user`)
  domain?: string
  year?: string
}

const SESSION_KEY = 'ethos_session'
const LEGACY_ADMIN_KEY = 'ethos_admin_authed'
const LEGACY_MEMBER_KEY = 'ethos_member'

/** Hierarchy for role checks. Higher = more powerful. */
const RANK: Record<Role, number> = {
  visitor: 0,
  user: 1,
  admin: 2,
  super_admin: 3,
}

function emit() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ethos-auth-changed'))
  }
}

/** Read the current session, migrating from legacy keys if needed. */
export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as SessionUser

    // Migrate legacy admin session
    if (sessionStorage.getItem(LEGACY_ADMIN_KEY) === 'true') {
      const u: SessionUser = { id: 'admin', name: 'Administrator', role: 'super_admin', username: 'admin' }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
      return u
    }

    // Migrate legacy member session
    const memberRaw = sessionStorage.getItem(LEGACY_MEMBER_KEY)
    if (memberRaw) {
      const m = JSON.parse(memberRaw)
      const u: SessionUser = {
        id: m.id ?? m.username ?? 'member',
        name: m.name ?? 'Member',
        email: m.email,
        username: m.username,
        role: 'user',
        domain: m.domain,
        year: m.year,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
      return u
    }
    return null
  } catch {
    return null
  }
}

export function setSession(user: SessionUser): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  // Mirror to legacy keys so older code keeps working until fully migrated.
  if (user.role === 'admin' || user.role === 'super_admin') {
    sessionStorage.setItem(LEGACY_ADMIN_KEY, 'true')
  } else if (user.role === 'user') {
    sessionStorage.setItem(LEGACY_MEMBER_KEY, JSON.stringify({
      id: user.id, name: user.name, username: user.username,
      role: 'Member', domain: user.domain, year: user.year, email: user.email,
    }))
  }
  emit()
}

export function signOut(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(LEGACY_ADMIN_KEY)
  sessionStorage.removeItem(LEGACY_MEMBER_KEY)
  emit()
}

/** True if the current user's role is at or above the required role. */
export function hasRole(required: Role): boolean {
  const user = getCurrentUser()
  if (!user) return required === 'visitor'
  return RANK[user.role] >= RANK[required]
}

/** Convenience: is there any authenticated user (admin or member)? */
export function isAuthed(): boolean {
  const u = getCurrentUser()
  return !!u && u.role !== 'visitor'
}

/** Where to send a user after sign-in based on their role. */
export function defaultLandingFor(role: Role): string {
  return role === 'admin' || role === 'super_admin'
    ? '/admin/dashboard'
    : '/member/dashboard'
}

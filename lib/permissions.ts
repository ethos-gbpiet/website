// ─── EtHOS capability-based permission system ────────────────────────────────
import type { AdminPermissions } from './db/schema'

export type Role = 'visitor' | 'user' | 'creator' | 'faculty' | 'admin' | 'super_admin'

// Linear rank used for "at-least-role" guards
export const ROLE_RANK: Record<Role, number> = {
  visitor:     0,
  user:        1,
  creator:     2,
  faculty:     3,
  admin:       4,
  super_admin: 5,
}

export function hasRole(actual: Role | undefined | null, required: Role): boolean {
  if (!actual) return required === 'visitor'
  return ROLE_RANK[actual] >= ROLE_RANK[required]
}

export type Capability =
  // Site-wide (super_admin only)
  | 'site.settings.write'
  | 'admins.manage'
  | 'permissions.manage'
  | 'passwords.manage'       // reset any user's password
  // Content — creator+
  | 'content.home.write'
  | 'content.about.write'
  | 'announcements.write'
  | 'gallery.write'
  | 'resources.write'
  // Team — super_admin only
  | 'team.write'
  // Ops — admin+
  | 'projects.write'
  | 'events.write'
  | 'members.manage'
  | 'attendance.mark'
  // Read-only — faculty+
  | 'inbox.view'
  | 'inbox.action'
  | 'attendance.view.all'

/**
 * Check if a (role + optional granular perms) grants a capability.
 * perms = the admin_permissions row for the user (only applicable when role === 'admin').
 */
export function can(
  role: Role | undefined | null,
  capability: Capability,
  perms?: Partial<AdminPermissions> | null,
): boolean {
  if (!role || role === 'visitor' || role === 'user') return false
  if (role === 'super_admin') return true

  // faculty — read-only platform-wide visibility
  if (role === 'faculty') {
    switch (capability) {
      case 'inbox.view':
      case 'attendance.view.all':
        return true
      default: return false
    }
  }

  // creator — content editor
  if (role === 'creator') {
    switch (capability) {
      case 'announcements.write':
      case 'gallery.write':
      case 'resources.write':
        return true
      default: return false
    }
  }

  // admin — granular via perms row
  switch (capability) {
    case 'site.settings.write':
    case 'admins.manage':
    case 'permissions.manage':
    case 'passwords.manage':
    case 'team.write':
      return false
    case 'content.home.write':    return perms?.canEditHome ?? true
    case 'content.about.write':   return perms?.canEditAbout ?? true
    case 'announcements.write':   return perms?.canEditAnnouncements ?? true
    case 'projects.write':        return perms?.canEditProjects ?? true
    case 'events.write':          return perms?.canEditEvents ?? true
    case 'resources.write':       return perms?.canEditResources ?? true
    case 'gallery.write':         return perms?.canEditGallery ?? false
    case 'members.manage':        return perms?.canManageMembers ?? false
    case 'attendance.mark':       return perms?.canMarkAttendance ?? true
    case 'attendance.view.all':   return perms?.canMarkAttendance ?? true
    case 'inbox.view':            return perms?.canViewInbox ?? true
    case 'inbox.action':          return perms?.canActionInbox ?? true
    default: return false
  }
}

export const defaultAdminPermissions: Omit<AdminPermissions, 'userId'> = {
  canEditHome:          true,
  canEditAbout:         true,
  canEditAnnouncements: true,
  canEditProjects:      true,
  canEditEvents:        true,
  canEditResources:     true,
  canEditGallery:       false,
  canManageMembers:     false,
  canMarkAttendance:    true,
  canViewInbox:         true,
  canActionInbox:       true,
}

/** Human-readable role labels */
export const ROLE_LABELS: Record<Role, string> = {
  visitor:     'Visitor',
  user:        'Member',
  creator:     'Creator',
  faculty:     'Faculty',
  admin:       'Admin',
  super_admin: 'Super Admin',
}

/** Role → default portal path */
export function defaultPortal(role: Role): string {
  switch (role) {
    case 'super_admin': return '/super-admin/dashboard'
    case 'admin':       return '/admin/dashboard'
    case 'faculty':     return '/faculty/dashboard'
    case 'creator':     return '/creator/dashboard'
    default:            return '/member/dashboard'
  }
}

// ─── EtHOS capability-based permission system ────────────────────────────────
import type { AdminPermissions } from './db/schema'

export type Role =
  | 'visitor'
  | 'user'
  | 'member'
  | 'creator'
  | 'coordinator'
  | 'core'
  | 'content_lead'
  | 'design_lead'
  | 'events_lead'
  | 'technical_lead'
  | 'faculty'
  | 'faculty_coordinator'
  | 'hod'
  | 'admin'
  | 'super_admin'

// Linear rank used for "at-least-role" guards
export const ROLE_RANK: Record<Role, number> = {
  visitor:             0,
  user:                1,
  member:              1,
  creator:             2,
  coordinator:         2,
  core:                2,
  content_lead:        3,
  design_lead:         3,
  events_lead:         3,
  technical_lead:      3,
  faculty:             4,
  faculty_coordinator: 4,
  hod:                 4,
  admin:               5,
  super_admin:         6,
}

export function hasRole(actual: Role | undefined | null, required: Role): boolean {
  if (!actual) return required === 'visitor'
  return ROLE_RANK[actual] >= ROLE_RANK[required]
}

export type Capability =
  | 'site.settings.write'
  | 'admins.manage'
  | 'permissions.manage'
  | 'passwords.manage'
  | 'content.home.write'
  | 'content.about.write'
  | 'announcements.write'
  | 'gallery.write'
  | 'resources.write'
  | 'team.write'
  | 'projects.write'
  | 'events.write'
  | 'members.manage'
  | 'attendance.mark'
  | 'inbox.view'
  | 'inbox.action'
  | 'attendance.view.all'

export function can(
  role: Role | undefined | null,
  capability: Capability,
  perms?: Partial<AdminPermissions> | null,
): boolean {
  if (!role || role === 'visitor' || role === 'user' || role === 'member') return false
  if (role === 'super_admin') return true

  // hod / faculty_coordinator / faculty — read-only platform-wide visibility
  if (role === 'hod' || role === 'faculty_coordinator' || role === 'faculty') {
    switch (capability) {
      case 'inbox.view':
      case 'attendance.view.all':
        return true
      default: return false
    }
  }

  // lead / core / coordinator roles — content + attendance
  if (
    role === 'technical_lead' ||
    role === 'events_lead'    ||
    role === 'content_lead'   ||
    role === 'design_lead'    ||
    role === 'core'           ||
    role === 'coordinator'
  ) {
    switch (capability) {
      case 'announcements.write':
      case 'attendance.mark':
      case 'inbox.view':
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

export const ROLE_LABELS: Record<Role, string> = {
  visitor:             'Visitor',
  user:                'Member',
  member:              'Member',
  creator:             'Creator',
  coordinator:         'Coordinator',
  core:                'Core Committee',
  content_lead:        'Content Lead',
  design_lead:         'Design Lead',
  events_lead:         'Events Lead',
  technical_lead:      'Technical Lead',
  faculty:             'Faculty',
  faculty_coordinator: 'Faculty Coordinator',
  hod:                 'HOD',
  admin:               'Admin',
  super_admin:         'Super Admin',
}

export function defaultPortal(role: Role): string {
  switch (role) {
    case 'super_admin': return '/super-admin/dashboard'
    case 'admin':       return '/admin/dashboard'
    case 'faculty':
    case 'faculty_coordinator':
    case 'hod':         return '/faculty/dashboard'
    case 'creator':     return '/creator/dashboard'
    default:            return '/member/dashboard'
  }
}
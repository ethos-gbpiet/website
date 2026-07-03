// ─── Member portal local data ────────────────────────────────────────────────
// Lightweight, client-side stores for things only a signed-in member needs:
// notifications, event registrations, joined projects, and feedback history.
// Persisted to localStorage so it survives reloads. Replace with API in prod.

export type NotificationKind = 'event' | 'project' | 'announcement' | 'system'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  date: string         // ISO timestamp
  href?: string
  read: boolean
}

export interface EventRegistration {
  eventId: number | string
  registeredAt: string
}

export interface JoinedProject {
  projectId: number | string
  joinedAt: string
  role?: string
}

export interface FeedbackEntry {
  id: string
  topic: string
  message: string
  createdAt: string
  status: 'received' | 'reviewed' | 'actioned'
}

const KEYS = {
  notifications: 'ethos_member_notifications',
  events: 'ethos_member_events',
  projects: 'ethos_member_projects',
  feedback: 'ethos_member_feedback',
} as const

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('ethos-member-data-updated'))
}

// ─── Notifications ──────────────────────────────────────────────────────────

const seedNotifications: Notification[] = [
  {
    id: 'n1',
    kind: 'event',
    title: 'Hardware Hackathon registrations open',
    body: 'EtHOS Hardware Hackathon 2026 is now accepting team registrations. Cap is 200 participants.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    href: '/events',
    read: false,
  },
  {
    id: 'n2',
    kind: 'project',
    title: 'New project update on RISC-V Core',
    body: 'Verification of the 5-stage pipeline completed. Tape-out target moved up.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    href: '/projects',
    read: false,
  },
  {
    id: 'n3',
    kind: 'announcement',
    title: 'Lab access window updated',
    body: 'PCB Lab is now open Mon–Sat, 10 AM – 8 PM. New badge required for after-hours.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    href: '/bulletin',
    read: true,
  },
]

export function getNotifications(): Notification[] {
  const stored = read<Notification[] | null>(KEYS.notifications, null)
  if (stored) return stored
  write(KEYS.notifications, seedNotifications)
  return seedNotifications
}

export function markNotificationRead(id: string) {
  const list = getNotifications().map(n => n.id === id ? { ...n, read: true } : n)
  write(KEYS.notifications, list)
}

export function markAllNotificationsRead() {
  const list = getNotifications().map(n => ({ ...n, read: true }))
  write(KEYS.notifications, list)
}

// ─── Event registrations ────────────────────────────────────────────────────

export function getEventRegistrations(): EventRegistration[] {
  return read<EventRegistration[]>(KEYS.events, [])
}

export function isRegisteredForEvent(eventId: number | string): boolean {
  return getEventRegistrations().some(r => String(r.eventId) === String(eventId))
}

export function toggleEventRegistration(eventId: number | string): boolean {
  const list = getEventRegistrations()
  const exists = list.some(r => String(r.eventId) === String(eventId))
  const next = exists
    ? list.filter(r => String(r.eventId) !== String(eventId))
    : [...list, { eventId, registeredAt: new Date().toISOString() }]
  write(KEYS.events, next)
  return !exists
}

// ─── Joined projects ────────────────────────────────────────────────────────

export function getJoinedProjects(): JoinedProject[] {
  return read<JoinedProject[]>(KEYS.projects, [])
}

export function isJoinedProject(projectId: number | string): boolean {
  return getJoinedProjects().some(p => String(p.projectId) === String(projectId))
}

export function toggleProjectMembership(projectId: number | string, role = 'Member'): boolean {
  const list = getJoinedProjects()
  const exists = list.some(p => String(p.projectId) === String(projectId))
  const next = exists
    ? list.filter(p => String(p.projectId) !== String(projectId))
    : [...list, { projectId, joinedAt: new Date().toISOString(), role }]
  write(KEYS.projects, next)
  return !exists
}

// ─── Feedback history ───────────────────────────────────────────────────────

export function getFeedbackHistory(): FeedbackEntry[] {
  return read<FeedbackEntry[]>(KEYS.feedback, [])
}

export function addFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>): FeedbackEntry {
  const created: FeedbackEntry = {
    ...entry,
    id: `fb_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'received',
  }
  write(KEYS.feedback, [created, ...getFeedbackHistory()])
  return created
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

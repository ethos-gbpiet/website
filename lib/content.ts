// ─── Public-website content reads ────────────────────────────────────────────
// Server-only helpers used by public pages. Cached with Next.js tags so a
// mutation in the admin can call `revalidateContent('projects')` and the
// public site reflects it on the next request — perfect sync.

import 'server-only'
import { unstable_cache, revalidateTag } from 'next/cache'
import { desc, eq } from 'drizzle-orm'
import { db } from './db/client'
import {
  siteSettings, pageContent,
  announcements, projects, events, teamMembers, resources, projectUpdates,
} from './db/schema'

export const TAGS = {
  settings:      'site:settings',
  home:          'page:home',
  about:         'page:about',
  announcements: 'announcements',
  projects:      'projects',
  events:        'events',
  team:          'team',
  resources:     'resources',
} as const

export type ContentTagKey = keyof typeof TAGS

// ── Reads (uncached single-row, cached collections) ─────────────────────────

export async function getSiteSettings() {
  const row = (await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1))[0]
  return row?.data
}

export async function getPageContent(slug: 'home' | 'about') {
  const row = (await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1))[0]
  return row?.data
}

export const getAnnouncements = unstable_cache(
  async () => db.select().from(announcements).orderBy(desc(announcements.pinned), desc(announcements.createdAt)),
  ['ethos:announcements'],
  { tags: [TAGS.announcements] },
)

export const getProjects = unstable_cache(
  async () => db.select().from(projects).orderBy(desc(projects.featured), desc(projects.createdAt)),
  ['ethos:projects'],
  { tags: [TAGS.projects] },
)

export async function getProjectById(id: string) {
  const row = (await db.select().from(projects).where(eq(projects.id, id)).limit(1))[0]
  if (!row) return null
  const updates = await db.select().from(projectUpdates).where(eq(projectUpdates.projectId, id)).orderBy(desc(projectUpdates.date))
  return { ...row, updates }
}

export const getEvents = unstable_cache(
  async () => db.select().from(events).orderBy(desc(events.featured), desc(events.createdAt)),
  ['ethos:events'],
  { tags: [TAGS.events] },
)

export async function getEventById(id: number) {
  return (await db.select().from(events).where(eq(events.id, id)).limit(1))[0] ?? null
}

export const getTeam = unstable_cache(
  async () => db.select().from(teamMembers).orderBy(teamMembers.sortOrder, teamMembers.name),
  ['ethos:team'],
  { tags: [TAGS.team] },
)

export const getResources = unstable_cache(
  async () => db.select().from(resources).orderBy(desc(resources.createdAt)),
  ['ethos:resources'],
  { tags: [TAGS.resources] },
)

// ── Cache invalidation (call from admin mutations) ──────────────────────────

export function revalidateContent(...keys: ContentTagKey[]) {
  for (const k of keys) revalidateTag(TAGS[k])
}

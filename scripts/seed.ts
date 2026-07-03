// ─── First-run seeder ───────────────────────────────────────────────────────
// 1. Creates the super-admin from SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD
// 2. Inserts default site settings, team roster, announcements, projects, events,
//    and resources from the static seed files (only if those tables are empty)
//
// Idempotent — safe to re-run after a deploy. Skips inserts if data exists.
//
// Usage:
//   pnpm db:setup          # push schema + run this seed
//   pnpm db:seed           # run this seed only

// NOTE: env vars must be loaded BEFORE `../lib/db/client` is imported, because
// that module reads process.env.DATABASE_URL at import time. Static `import`
// statements are hoisted above regular code by the JS engine, so loading env
// vars here (even before the imports textually) would NOT work. Instead we
// load env vars first, then use dynamic import() — which is NOT hoisted —
// inside loadModules() below, called at the top of main(). (We deliberately
// avoid top-level await since tsx/esbuild transforms this file as CommonJS,
// which does not support top-level await.)
import { config as loadEnv } from 'dotenv'
import bcrypt from 'bcryptjs'
import { eq, sql } from 'drizzle-orm'

// Load .env.local first (Next.js convention), then fall back to .env
loadEnv({ path: '.env.local' })
loadEnv()

let db: any
let users: any, adminPermissions: any, siteSettings: any, pageContent: any,
  announcements: any, projects: any, events: any, teamMembers: any, resources: any
let defaultAdminPermissions: any
let seedTeam: any, seedProjects: any, seedEvents: any, seedAnnouncements: any, seedResources: any

async function loadModules() {
  ;({ db } = await import('../lib/db/client'))
  ;({
    users, adminPermissions, siteSettings, pageContent,
    announcements, projects, events, teamMembers, resources,
  } = await import('../lib/db/schema'))
  ;({ defaultAdminPermissions } = await import('../lib/permissions'))
  ;({
    team: seedTeam,
    projects: seedProjects,
    events: seedEvents,
    announcements: seedAnnouncements,
    resources: seedResources,
  } = await import('../data'))
}

const DEFAULT_SETTINGS = {
  siteName: 'EtHOS',
  siteTagline: 'Electronics and Hardware Oriented Society',
  heroHeading: ['Design.', 'Build.', 'Power.'],
  heroSubtext:
    'EtHOS is the Electronics and Hardware Oriented Society of IET College. We design PCBs, build embedded systems, and push the boundaries of hardware engineering — from schematics to silicon.',
  aboutTitle: 'Where the schematic becomes real',
  aboutBody:
    'EtHOS is the dedicated electronics and hardware society of IET College, Dehradun.',
  contactEmail: 'ethos@iet.edu',
  contactPhone: '+91 98765 43210',
  contactAddress: 'PCB Lab, Block D, IET College, Dehradun — 248001',
  contactHours: 'Mon – Sat, 10 AM – 8 PM',
  github: 'https://github.com/ethos-iet',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  collegeFullName: 'IET College, Dehradun',
  foundedYear: '2014',
}

function log(stage: string, msg: string) {
  console.log(`  [${stage}] ${msg}`)
}

async function rowCount(table: any): Promise<number> {
  const r = await db.execute(sql`select count(*)::int as c from ${table}`)
  // @ts-ignore — neon-http returns array of rows
  return Number((r as any)[0]?.c ?? (r as any).rows?.[0]?.c ?? 0)
}

async function seedSuperAdmin(): Promise<string> {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error('SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD must be set')
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    log('super-admin', `already exists (${email}) — skipping`)
    return existing[0].id
  }

  const hash = await bcrypt.hash(password, 10)
  const [created] = await db
    .insert(users)
    .values({ email, passwordHash: hash, name: 'Super Admin', role: 'super_admin' })
    .returning({ id: users.id })

  // Super admin doesn't need a row in admin_permissions, but seed one for visibility.
  await db.insert(adminPermissions).values({
    userId: created.id,
    ...defaultAdminPermissions,
    canManageMembers: true,
  }).onConflictDoNothing()

  log('super-admin', `created (${email})`)
  return created.id
}

async function seedSettings(actorId: string) {
  const count = await rowCount(siteSettings)
  if (count > 0) { log('settings', 'already present — skipping'); return }
  await db.insert(siteSettings).values({ id: 1, data: DEFAULT_SETTINGS, updatedBy: actorId })
  log('settings', 'inserted defaults')
}

async function seedPages(actorId: string) {
  const count = await rowCount(pageContent)
  if (count > 0) { log('pages', 'already present — skipping'); return }
  await db.insert(pageContent).values([
    { slug: 'home', updatedBy: actorId, data: {
      heroEyebrow: '// system online',
      heroHeading: DEFAULT_SETTINGS.heroHeading,
      heroSubtext: DEFAULT_SETTINGS.heroSubtext,
      featuredHeading: 'What we ship',
      featuredSubtext: 'A glimpse of the projects, events, and updates currently moving through the lab.',
    } },
    { slug: 'about', updatedBy: actorId, data: {
      title: DEFAULT_SETTINGS.aboutTitle,
      body: DEFAULT_SETTINGS.aboutBody,
      vision: 'Build the hardware engineers of tomorrow through hands-on innovation.',
      mission: 'PCB design. Embedded systems. Power electronics. RF. FPGAs. From schematic to silicon.',
    } },
  ])
  log('pages', 'seeded home + about')
}

async function seedTeamRoster() {
  const count = await rowCount(teamMembers)
  if (count > 0) { log('team', 'already present — skipping'); return }
  const rows = (seedTeam as any[]).map((t, i) => ({
    id: String(t.id),
    name: t.name,
    role: t.role,
    year: t.year ?? null,
    yearNum: t.yearNum ?? null,
    bio: t.bio ?? null,
    domain: t.domain ?? null,
    avatar: t.avatar ?? t.photo ?? null,
    github: t.github ?? null,
    linkedin: t.linkedin ?? null,
    email: t.email ?? null,
    section: t.section ?? 'core',
    featured: !!t.featured,
    sortOrder: i,
  }))
  await db.insert(teamMembers).values(rows)
  log('team', `inserted ${rows.length} members`)
}

async function seedAnnouncementsTable(actorId: string) {
  const count = await rowCount(announcements)
  if (count > 0) { log('announcements', 'already present — skipping'); return }
  const rows = (seedAnnouncements as any[]).map((a) => ({
    title: a.title,
    content: a.content ?? a.body ?? '',
    category: a.category ?? null,
    pinned: !!a.pinned,
    createdBy: actorId,
  }))
  if (rows.length === 0) { log('announcements', 'no seed data — skipping'); return }
  await db.insert(announcements).values(rows)
  log('announcements', `inserted ${rows.length}`)
}

async function seedProjectsTable() {
  const count = await rowCount(projects)
  if (count > 0) { log('projects', 'already present — skipping'); return }
  const rows = (seedProjects as any[]).map((p) => ({
    id: String(p.id),
    title: p.title,
    tagline: p.tagline ?? null,
    description: p.description ?? null,
    category: p.category ?? null,
    tech: Array.isArray(p.tech) ? p.tech : [],
    team: Array.isArray(p.team) ? p.team : [],
    status: (p.status ?? 'Planning') as any,
    progress: Number(p.progress ?? 0),
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    github: p.github ?? null,
    cover: p.cover ?? null,
    featured: !!p.featured,
  }))
  if (rows.length > 0) {
    await db.insert(projects).values(rows)
    log('projects', `inserted ${rows.length}`)
  }
}

async function seedEventsTable() {
  const count = await rowCount(events)
  if (count > 0) { log('events', 'already present — skipping'); return }
  const rows = (seedEvents as any[]).map((e) => ({
    title: e.title,
    description: e.description ?? null,
    category: e.category ?? null,
    date: e.date ?? null,
    time: e.time ?? null,
    venue: e.venue ?? null,
    capacity: Number(e.capacity ?? 0),
    registrations: Number(e.registrations ?? e.registered ?? 0),
    status: (e.status ?? 'Upcoming') as any,
    cover: e.cover ?? null,
    featured: !!e.featured,
  }))
  if (rows.length > 0) {
    await db.insert(events).values(rows)
    log('events', `inserted ${rows.length}`)
  }
}

async function seedResourcesTable(actorId: string) {
  const count = await rowCount(resources)
  if (count > 0) { log('resources', 'already present — skipping'); return }
  const rows = (seedResources as any[]).map((r) => ({
    title: r.title,
    description: r.description ?? null,
    url: r.url ?? r.href ?? '#',
    type: r.type ?? null,
    size: r.size ?? null,
    category: r.category ?? null,
    memberOnly: !!r.memberOnly,
    uploadedBy: actorId,
  }))
  if (rows.length > 0) {
    await db.insert(resources).values(rows)
    log('resources', `inserted ${rows.length}`)
  }
}

async function main() {
  console.log('→ EtHOS seed starting…')
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local before running.')
  }
  await loadModules()
  const adminId = await seedSuperAdmin()
  await seedSettings(adminId)
  await seedPages(adminId)
  await seedTeamRoster()
  await seedAnnouncementsTable(adminId)
  await seedProjectsTable()
  await seedEventsTable()
  await seedResourcesTable(adminId)
  console.log('✓ EtHOS seed complete')
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('✗ Seed failed:', err); process.exit(1) })

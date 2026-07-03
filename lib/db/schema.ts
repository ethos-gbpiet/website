// ─── EtHOS — Drizzle schema (PostgreSQL / Neon) ──────────────────────────────
import {
  pgTable, pgEnum,
  text, varchar, integer, serial, boolean, json, timestamp, uuid,
  primaryKey, uniqueIndex, index,
} from 'drizzle-orm/pg-core'

// ── Enums ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum('role', [
  'user',         // regular member
  'creator',      // bulletin / gallery / resources editor
  'faculty',      // faculty coordinator – read-all + approval
  'admin',        // events / projects / member management
  'super_admin',  // full control
])
export const inboxKindEnum        = pgEnum('inbox_kind',        ['contact', 'collaboration', 'feedback', 'submission'])
export const inboxStatusEnum      = pgEnum('inbox_status',      ['new', 'pending', 'replied', 'resolved', 'rejected'])
export const eventStatusEnum      = pgEnum('event_status',      ['Upcoming', 'Ongoing', 'Past', 'Cancelled'])
export const projectStatusEnum    = pgEnum('project_status',    ['Planning', 'In Progress', 'Completed', 'On Hold'])
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'leave', 'late'])

// ── Identity & access ────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  role:         roleEnum('role').notNull().default('user'),
  active:       boolean('active').notNull().default(true),
  createdById:  uuid('created_by_id'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

export const memberProfiles = pgTable('member_profiles', {
  userId:   uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  domain:   varchar('domain', { length: 100 }),
  year:     varchar('year', { length: 50 }),
  yearNum:  integer('year_num'),
  bio:      text('bio'),
  github:   varchar('github', { length: 255 }),
  linkedin: varchar('linkedin', { length: 255 }),
  avatar:   text('avatar'),
  mentorId: uuid('mentor_id').references(() => users.id),
})

export const adminPermissions = pgTable('admin_permissions', {
  userId:               uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  canEditHome:          boolean('can_edit_home').default(true).notNull(),
  canEditAbout:         boolean('can_edit_about').default(true).notNull(),
  canEditAnnouncements: boolean('can_edit_announcements').default(true).notNull(),
  canEditProjects:      boolean('can_edit_projects').default(true).notNull(),
  canEditEvents:        boolean('can_edit_events').default(true).notNull(),
  canEditResources:     boolean('can_edit_resources').default(true).notNull(),
  canEditGallery:       boolean('can_edit_gallery').default(false).notNull(),
  canManageMembers:     boolean('can_manage_members').default(false).notNull(),
  canMarkAttendance:    boolean('can_mark_attendance').default(true).notNull(),
  canViewInbox:         boolean('can_view_inbox').default(true).notNull(),
  canActionInbox:       boolean('can_action_inbox').default(true).notNull(),
})

// ── Editable site content ────────────────────────────────────────────────────
export const siteSettings = pgTable('site_settings', {
  id:        integer('id').primaryKey().default(1),
  data:      json('data').$type<Record<string, any>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
})

export const pageContent = pgTable('page_content', {
  slug:      varchar('slug', { length: 50 }).primaryKey(),
  data:      json('data').$type<Record<string, any>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
})

export const announcements = pgTable('announcements', {
  id:        serial('id').primaryKey(),
  title:     varchar('title', { length: 255 }).notNull(),
  content:   text('content').notNull(),
  category:  varchar('category', { length: 50 }),
  pinned:    boolean('pinned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

export const projects = pgTable('projects', {
  id:          varchar('id', { length: 80 }).primaryKey(),
  title:       varchar('title', { length: 255 }).notNull(),
  tagline:     text('tagline'),
  description: text('description'),
  category:    varchar('category', { length: 50 }),
  tech:        json('tech').$type<string[]>().default([]).notNull(),
  team:        json('team').$type<string[]>().default([]).notNull(),
  status:      projectStatusEnum('status').default('Planning').notNull(),
  progress:    integer('progress').default(0).notNull(),
  startDate:   varchar('start_date', { length: 50 }),
  endDate:     varchar('end_date', { length: 50 }),
  github:      varchar('github', { length: 255 }),
  cover:       text('cover'),
  featured:    boolean('featured').default(false).notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const projectUpdates = pgTable('project_updates', {
  id:        serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 80 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  date:      varchar('date', { length: 20 }).notNull(),
  title:     varchar('title', { length: 255 }).notNull(),
  body:      text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

export const events = pgTable('events', {
  id:            serial('id').primaryKey(),
  title:         varchar('title', { length: 255 }).notNull(),
  description:   text('description'),
  category:      varchar('category', { length: 50 }),
  date:          varchar('date', { length: 50 }),
  time:          varchar('time', { length: 50 }),
  venue:         varchar('venue', { length: 255 }),
  capacity:      integer('capacity').default(0).notNull(),
  registrations: integer('registrations').default(0).notNull(),
  status:        eventStatusEnum('status').default('Upcoming').notNull(),
  cover:         text('cover'),
  featured:      boolean('featured').default(false).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

export const eventRegistrations = pgTable('event_registrations', {
  eventId:      integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.eventId, t.userId] }) }))

export const projectMembers = pgTable('project_members', {
  projectId: varchar('project_id', { length: 80 }).references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role:      varchar('role', { length: 100 }).default('Member').notNull(),
  joinedAt:  timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.projectId, t.userId] }) }))

export const teamMembers = pgTable('team_members', {
  id:        varchar('id', { length: 50 }).primaryKey(),
  name:      varchar('name', { length: 255 }).notNull(),
  role:      varchar('role', { length: 100 }).notNull(),
  year:      varchar('year', { length: 100 }),
  yearNum:   integer('year_num'),
  bio:       text('bio'),
  domain:    varchar('domain', { length: 100 }),
  avatar:    text('avatar'),
  github:    varchar('github', { length: 255 }),
  linkedin:  varchar('linkedin', { length: 255 }),
  email:     varchar('email', { length: 255 }),
  section:   varchar('section', { length: 50 }).notNull(),
  featured:  boolean('featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const resources = pgTable('resources', {
  id:          serial('id').primaryKey(),
  title:       varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  url:         text('url').notNull(),
  type:        varchar('type', { length: 50 }),
  size:        varchar('size', { length: 50 }),
  category:    varchar('category', { length: 100 }),
  memberOnly:  boolean('member_only').default(false).notNull(),
  uploadedBy:  uuid('uploaded_by').references(() => users.id),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const galleryItems = pgTable('gallery_items', {
  id:          serial('id').primaryKey(),
  title:       varchar('title', { length: 255 }),
  description: text('description'),
  url:         text('url').notNull(),
  category:    varchar('category', { length: 50 }),
  featured:    boolean('featured').default(false).notNull(),
  uploadedBy:  uuid('uploaded_by').references(() => users.id),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

// ── Inbox / action centre ────────────────────────────────────────────────────
export const inboxItems = pgTable('inbox_items', {
  id:         serial('id').primaryKey(),
  kind:       inboxKindEnum('kind').notNull(),
  status:     inboxStatusEnum('status').default('new').notNull(),
  fromName:   varchar('from_name', { length: 255 }),
  fromEmail:  varchar('from_email', { length: 255 }),
  subject:    varchar('subject', { length: 255 }),
  body:       text('body').notNull(),
  meta:       json('meta').$type<Record<string, any>>().default({}).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  byStatus: index('inbox_by_status').on(t.status),
  byKind:   index('inbox_by_kind').on(t.kind),
}))

export const inboxActions = pgTable('inbox_actions', {
  id:        serial('id').primaryKey(),
  itemId:    integer('item_id').references(() => inboxItems.id, { onDelete: 'cascade' }).notNull(),
  actorId:   uuid('actor_id').references(() => users.id),
  action:    varchar('action', { length: 50 }).notNull(),
  note:      text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Attendance & work-hours ──────────────────────────────────────────────────
export const attendanceRecords = pgTable('attendance_records', {
  id:        serial('id').primaryKey(),
  memberId:  uuid('member_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date:      varchar('date', { length: 10 }).notNull(),
  status:    attendanceStatusEnum('status').notNull(),
  workHours: integer('work_hours').default(0).notNull(),
  notes:     text('notes'),
  markedBy:  uuid('marked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  uniqMemberDate: uniqueIndex('attendance_uniq_member_date').on(t.memberId, t.date),
}))

// ── Notifications ────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:        serial('id').primaryKey(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  kind:      varchar('kind', { length: 50 }).notNull(),
  title:     varchar('title', { length: 255 }).notNull(),
  body:      text('body'),
  href:      varchar('href', { length: 500 }),
  read:      boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({ byUser: index('notif_by_user').on(t.userId) }))

// ── Activity log ─────────────────────────────────────────────────────────────
export const activityLogs = pgTable('activity_logs', {
  id:        serial('id').primaryKey(),
  actorId:   uuid('actor_id').references(() => users.id),
  action:    varchar('action', { length: 100 }).notNull(),
  target:    varchar('target', { length: 255 }),
  meta:      json('meta').$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Inferred types ────────────────────────────────────────────────────────────
export type User             = typeof users.$inferSelect
export type NewUser          = typeof users.$inferInsert
export type AdminPermissions = typeof adminPermissions.$inferSelect
export type Announcement     = typeof announcements.$inferSelect
export type Project          = typeof projects.$inferSelect
export type Event            = typeof events.$inferSelect
export type TeamMember       = typeof teamMembers.$inferSelect
export type Resource         = typeof resources.$inferSelect
export type InboxItem        = typeof inboxItems.$inferSelect
export type AttendanceRecord = typeof attendanceRecords.$inferSelect
export type Notification     = typeof notifications.$inferSelect

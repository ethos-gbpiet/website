# TechSoc — Technical Society Website

The official website scaffold for the **Technical Society of IET College**, built with Next.js 14 App Router, React, Tailwind CSS, and a fully custom design system.

---

## ✨ Features

- **13 public pages** — Home, About, Team, Projects, Project Detail, Events, Event Detail, Bulletin, Gallery, Resources, Feedback, Collaborate, Contact, FAQ
- **10 admin pages** — Dashboard, Announcements, Projects, Project Updates, Events, Feedback, Collaboration Requests, Messages, Team, Media/Documents
- **Dark / Light mode** with `next-themes`, defaulting to dark
- **Fully responsive** — mobile-first with a collapsible navbar
- **Sticky filter bars** on Projects, Events, Bulletin, Gallery pages
- **Progress tracking** — visual progress bars on all project cards and detail pages
- **Event registration widget** — capacity bar, register button, past-event feedback CTA
- **Admin CRUD** — inline create, edit, delete across all admin pages (client-side state; wire to API for production)
- **Star ratings** — interactive 5-star rating component on the feedback form
- **Masonry gallery** — with lightbox viewer
- **Searchable FAQ accordion**
- **Futuristic retro design system** — cyan + electric purple palette, grid backgrounds, glow effects, JetBrains Mono terminal text

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Build for production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
techsoc/
├── app/
│   ├── layout.tsx                  ← Root layout: ThemeProvider, Toaster, fonts
│   ├── globals.css                 ← Design system: CSS variables, animations, utilities
│   │
│   ├── (public)/                   ← Public-facing pages (Navbar + Footer layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← Home
│   │   ├── about/page.tsx
│   │   ├── team/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx            ← Project listing (filterable)
│   │   │   └── [id]/page.tsx       ← Project detail + updates timeline
│   │   ├── events/
│   │   │   ├── page.tsx            ← Events listing (filterable)
│   │   │   └── [id]/page.tsx       ← Event detail + registration
│   │   ├── bulletin/page.tsx       ← Announcements with pinned/category filters
│   │   ├── gallery/page.tsx        ← Masonry gallery with lightbox
│   │   ├── resources/page.tsx      ← Documents & links by category
│   │   ├── feedback/page.tsx       ← Event feedback form (star ratings)
│   │   ├── collaborate/page.tsx    ← Collaboration request form
│   │   ├── contact/page.tsx        ← Contact form + social links
│   │   └── faq/page.tsx            ← Searchable FAQ accordion
│   │
│   └── admin/                      ← Admin panel (sidebar layout, no auth)
│       ├── layout.tsx              ← Sidebar navigation
│       ├── dashboard/page.tsx      ← Stats, activity, quick actions
│       ├── announcements/page.tsx  ← CRUD + pin/unpin
│       ├── projects/page.tsx       ← Project cards with progress
│       ├── project-updates/page.tsx← Timeline post system
│       ├── events/page.tsx         ← Table with capacity bars
│       ├── feedback/page.tsx       ← Aggregated ratings + individual cards
│       ├── collaboration/page.tsx  ← Accept/review/reject requests
│       ├── messages/page.tsx       ← Email-client-style inbox
│       ├── team/page.tsx           ← Member CRUD
│       └── media/page.tsx          ← Resource management
│
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              ← Sticky nav, dropdowns, mobile menu, theme toggle
│   │   ├── footer.tsx              ← Multi-column footer with social links
│   │   └── theme-provider.tsx
│   │
│   ├── shared/                     ← Reusable cross-page components
│   │   ├── index.ts                ← Barrel export
│   │   ├── page-header.tsx         ← Hero section header for public pages
│   │   ├── section-header.tsx      ← In-page section titles with "view all" link
│   │   ├── status-badge.tsx        ← ProjectStatusBadge, EventStatusBadge
│   │   ├── project-card.tsx        ← Full project card with progress bar
│   │   ├── event-card.tsx          ← Full event card with capacity bar
│   │   ├── team-member-card.tsx    ← Full / compact team member card
│   │   ├── admin-table.tsx         ← Generic admin data table
│   │   ├── admin-form-modal.tsx    ← Reusable admin create/edit modal
│   │   └── empty-state.tsx         ← Empty / no-results placeholder
│   │
│   └── ui/                         ← Design system primitives
│       ├── index.ts                ← Barrel export
│       ├── button.tsx              ← Button (default, outline, ghost, glow, outline-primary)
│       ├── badge.tsx               ← Badge (default, success, warning, cyan, purple, etc.)
│       ├── card.tsx                ← Card, CardHeader, CardTitle, CardContent, CardFooter
│       ├── form-elements.tsx       ← Input, Textarea, Label, Select
│       ├── progress.tsx            ← Progress bar
│       └── toaster.tsx             ← Toast system (ToastProvider, useToast, Toaster)
│
├── data/
│   └── index.ts                    ← All placeholder data (team, projects, events, etc.)
│
├── lib/
│   └── utils.ts                    ← cn(), formatDate(), categoryColor()
│
├── public/                         ← Static assets
│   └── (add images here)
│
├── tailwind.config.ts              ← Design tokens: colors, fonts, animations, bg patterns
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── .eslintrc.json
```

---

## 🎨 Design System

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#00E5FF` (cyan) | CTAs, links, progress bars, glows |
| `--accent` | `#7C3AED` (electric purple) | Secondary highlights, tags |
| `--background` | `hsl(220 40% 5%)` dark / `hsl(220 20% 97%)` light | Page backgrounds |
| `--card` | `hsl(220 35% 8%)` dark | Card backgrounds |

### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | **Syne** | 600–800 |
| Body | **Space Grotesk** | 400–500 |
| Code / Mono labels | **JetBrains Mono** | 400–500 |

### Utility Classes (globals.css)

```css
.gradient-text       /* cyan → purple gradient text */
.glow-cyan           /* box shadow glow in primary colour */
.glow-cyan-sm        /* subtle glow variant */
.text-glow           /* text-shadow glow */
.bg-grid             /* animated dotted grid background */
.card-hover          /* lift + border glow on hover */
.tag                 /* base small monospace tag */
.tag-cyan / .tag-purple / .tag-green / .tag-orange / .tag-red
.status-dot          /* small inline status indicator dot */
.status-active / .status-pending / .status-inactive
.animated-underline  /* animated underline on hover */
.terminal-text       /* monospace + primary colour */
.page-transition     /* fade-up animation on page load */
.shimmer             /* loading skeleton shimmer */
```

---

## 🗄️ Data Layer

All data lives in `data/index.ts` as typed TypeScript arrays. To connect a real backend:

1. Replace each `export const` with an async fetch function or React Server Component data fetch
2. Update page components to `await` the data (they're already Server Components where possible)
3. Add a database (PostgreSQL + Prisma, Supabase, MongoDB, etc.) and expose REST or GraphQL endpoints

### Data Exports

| Export | Fields |
|--------|--------|
| `team` | id, name, role, year, bio, avatar, github, linkedin, domain, featured |
| `projects` | id, title, tagline, description, category, status, progress, tech[], team[], startDate, endDate, featured, updates[] |
| `events` | id, title, description, longDescription, date, time, venue, category, status, registrations, capacity, fee, highlights[], schedule[] |
| `announcements` | id, title, content, category, date, pinned, author |
| `resources` | id, title, description, type (pdf/doc/link/video), size, category, url |
| `faqs` | id, question, answer, category |
| `gallery` | id, title, category, url |
| `stats` | label, value |

---

## 🔐 Admin Panel

The admin panel at `/admin/dashboard` has **no authentication** in this scaffold — add NextAuth.js, Clerk, or your preferred auth provider and wrap the `app/admin/layout.tsx` with a session check.

**Quick auth addition with NextAuth:**

```tsx
// app/admin/layout.tsx — add this wrapper
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await getServerSession()
  if (!session) redirect('/login')
  return <AdminLayoutInner>{children}</AdminLayoutInner>
}
```

---

## 🧩 Extending the Site

### Add a new public page

1. Create `app/(public)/your-page/page.tsx`
2. Add the route to `components/layout/navbar.tsx` `navLinks` array
3. Add the link to `components/layout/footer.tsx` `footerLinks` object

### Add a new admin page

1. Create `app/admin/your-section/page.tsx`
2. Add the route to `app/admin/layout.tsx` `navSections` array

### Add a new data type

1. Add the TypeScript array to `data/index.ts`
2. Export it from the same file
3. Import in your page: `import { yourData } from '@/data'`

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | Framework (App Router, RSC, Image, Link) |
| `react` 18 | UI library |
| `tailwindcss` 3 | Utility-first CSS |
| `tailwindcss-animate` | Keyframe animation utilities |
| `next-themes` | Dark/light mode with SSR hydration |
| `lucide-react` | Icon set |
| `clsx` + `tailwind-merge` | Conditional className merging (`cn()`) |
| `class-variance-authority` | Type-safe component variants |
| `@radix-ui/*` | Accessible primitives (Dialog, Toast, etc.) |
| `framer-motion` | Advanced animations (available, not yet wired) |

---

## 🗺️ Roadmap / Production TODOs

- [ ] Add NextAuth.js / Clerk authentication for admin panel
- [ ] Connect PostgreSQL + Prisma (or Supabase) for persistent data
- [ ] Add file upload support (Uploadthing / AWS S3) for gallery and documents
- [ ] Implement real event registration with Razorpay / UPI payment
- [ ] Add email notifications (Resend / Nodemailer) for contact/collab forms
- [ ] SEO metadata with `generateMetadata()` on all pages
- [ ] Add analytics (Plausible / Vercel Analytics)
- [ ] Progressive Web App (PWA) with `next-pwa`
- [ ] Rate limiting on form submissions (Upstash Redis)
- [ ] E2E tests with Playwright

---

## 📄 Licence

MIT — free to use, adapt, and deploy for your own college technical society.

Built with ❤️ by TechSoc, IET College.

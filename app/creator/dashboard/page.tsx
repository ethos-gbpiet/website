import { Suspense } from 'react'
import Link from 'next/link'
import { BookOpen, Megaphone, Image, FileText, PlusCircle, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/lib/db/client'
import { announcements, resources, galleryItems } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'

async function CreatorStats() {
  const [[annCount], [resCount], [galCount], recent] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(announcements),
    db.select({ c: sql<number>`count(*)::int` }).from(resources),
    db.select({ c: sql<number>`count(*)::int` }).from(galleryItems),
    db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(4),
  ])

  const stats = [
    { label: 'Announcements', value: annCount.c, icon: Megaphone, color: 'text-violet-400', href: '/creator/announcements' },
    { label: 'Resources',     value: resCount.c, icon: FileText,  color: 'text-cyan-400',   href: '/creator/resources' },
    { label: 'Gallery items', value: galCount.c, icon: Image,     color: 'text-pink-400',   href: '/creator/gallery' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-violet-400" /> Recent Announcements
          </h3>
          <Link href="/creator/announcements" className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No announcements yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map(a => (
              <li key={a.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.pinned ? 'bg-amber-400' : 'bg-primary'}`} />
                <span className="text-sm truncate flex-1">{a.title}</span>
                {a.pinned && <span className="text-[10px] font-mono text-amber-400 shrink-0">Pinned</span>}
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'New Announcement', href: '/creator/announcements?action=new', icon: Megaphone },
          { label: 'Upload to Gallery', href: '/creator/gallery?action=upload', icon: Image },
          { label: 'Add Resource',      href: '/creator/resources?action=add', icon: FileText },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
            <PlusCircle className="w-4 h-4 text-primary" /> {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function CreatorDashboard() {
  const user = await getCurrentUser()
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono text-violet-400/80">// creator_studio</span>
        </div>
        <h1 className="text-2xl font-display font-bold">Creator Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.name}. Manage bulletin, gallery & resources.</p>
      </div>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <CreatorStats />
      </Suspense>
    </div>
  )
}

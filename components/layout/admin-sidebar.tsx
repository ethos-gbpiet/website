'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Megaphone, FolderKanban, GitCommit, CalendarDays,
  MessageSquare, Handshake, Mail, Users, Image, Cpu, ChevronRight,
  LogOut, Settings, Send, UserCheck, ShieldCheck, ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
  {
    label: 'Overview',
    items: [{ href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Site Management',
    items: [
      { href: '/admin/settings',        icon: Settings,     label: 'Site Settings' },
      { href: '/admin/announcements',   icon: Megaphone,    label: 'Announcements' },
      { href: '/admin/projects',        icon: FolderKanban, label: 'Projects' },
      { href: '/admin/project-updates', icon: GitCommit,    label: 'Project Updates' },
      { href: '/admin/events',          icon: CalendarDays, label: 'Events' },
      { href: '/admin/team',            icon: Users,        label: 'Team Members' },
      { href: '/admin/media',           icon: Image,        label: 'Media & Documents' },
    ],
  },
  {
    label: 'Member Portal',
    items: [
      { href: '/admin/members',     icon: UserCheck,     label: 'Member Accounts' },
      { href: '/admin/submissions', icon: Send,          label: 'Submissions Review' },
      { href: '/admin/attendance',  icon: ClipboardList, label: 'Attendance & Hours' },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { href: '/admin/feedback',      icon: MessageSquare, label: 'Feedback' },
      { href: '/admin/collaboration', icon: Handshake,     label: 'Collaboration' },
      { href: '/admin/messages',      icon: Mail,          label: 'Messages' },
    ],
  },
]

interface AdminSidebarProps {
  user: { name: string; role: string }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar w-60 shrink-0 flex flex-col fixed top-0 left-0 h-full z-40 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-sm">Et<span className="text-primary">HOS</span></span>
          <span className="text-[9px] font-mono text-muted-foreground mt-0.5">Admin Panel</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="status-dot status-active" />
          <span className="text-[9px] font-mono text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Active admin */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
          <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {navSections.map(section => (
          <div key={section.label} className="mb-5">
            <p className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
              {`// ${section.label.toLowerCase().replace(' ', '_')}`}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <li key={href}>
                    <Link href={href} className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                    )}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-0.5">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Cpu className="w-4 h-4" /> Back to Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}

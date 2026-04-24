'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Cpu, LayoutDashboard, User, Send, LogOut, Bell, Settings as SettingsIcon,
  ChevronRight, Menu, CalendarCheck, FolderGit2, MessageSquare, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AuthGuard from '@/components/layout/auth-guard'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getNotifications } from '@/lib/member-data'

interface SimpleUser { id: string; name: string; role: string; domain?: string; year?: string }

const navSections = [
  {
    label: 'overview',
    items: [
      { href: '/member/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/member/notifications', icon: Bell,            label: 'Notifications' },
    ],
  },
  {
    label: 'my_activity',
    items: [
      { href: '/member/events',        icon: CalendarCheck, label: 'My Events' },
      { href: '/member/projects',      icon: FolderGit2,    label: 'My Projects' },
      { href: '/member/feedback',      icon: MessageSquare, label: 'Feedback History' },
      { href: '/member/submit',        icon: Send,          label: 'Submit Content' },
    ],
  },
  {
    label: 'account',
    items: [
      { href: '/member/profile',       icon: User,         label: 'My Profile' },
      { href: '/member/resources',     icon: BookOpen,     label: 'Resources' },
      { href: '/member/settings',      icon: SettingsIcon, label: 'Account Settings' },
    ],
  },
]

function MemberShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [member, setMember] = useState<SimpleUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const u = getCurrentUser()
    if (u) setMember({ id: u.id, name: u.name, role: u.role, domain: u.domain, year: u.year })
    setUnread(getNotifications().filter(n => !n.read).length)
  }, [pathname])

  function handleLogout() {
    signOut()
    router.replace('/member/login')
  }

  if (!member) return null

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col bg-card border-r border-border h-full',
      mobile ? 'w-full' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-sm">
            Et<span className="text-primary">HOS</span>
          </span>
          <span className="text-[9px] font-mono text-muted-foreground mt-0.5">Member Portal</span>
        </div>
      </div>

      {/* Member badge */}
      <div className="px-4 py-3 border-b border-border">
        <Link href="/member/profile" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-electric border border-primary/30 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{member.name}</p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">{member.domain ?? member.role} · {member.year ?? '—'}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
              {`// ${section.label}`}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                const showBadge = href === '/member/notifications' && unread > 0
                return (
                  <li key={href}>
                    <Link href={href} onClick={() => setSidebarOpen(false)} className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors border',
                      active
                        ? 'bg-primary/10 text-primary font-medium border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent'
                    )}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {showBadge ? (
                        <span className="text-[10px] font-mono bg-primary/15 text-primary border border-primary/30 px-1.5 rounded-full min-w-[18px] text-center">
                          {unread}
                        </span>
                      ) : active && <ChevronRight className="w-3 h-3" />}
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
          <Cpu className="w-4 h-4" /> View Public Site
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-left">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 shrink-0 fixed top-0 left-0 h-full z-40 flex-col">
        <Sidebar />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 flex-shrink-0 flex flex-col">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-sm">
            Et<span className="text-primary">HOS</span> Member
          </span>
          <Link href="/member/notifications" className="relative p-2 rounded-md hover:bg-muted">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary glow-cyan-sm" />
            )}
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 page-transition">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = pathname === '/member/login' || pathname === '/member/register'
  if (isPublic) return <>{children}</>
  return (
    <AuthGuard role="user" publicPaths={['/member/login', '/member/register']}>
      <MemberShell>{children}</MemberShell>
    </AuthGuard>
  )
}

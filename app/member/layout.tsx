'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Cpu, LayoutDashboard, User, Send, LogOut,
  ChevronRight, Bell, Menu, X
} from 'lucide-react'

interface MemberSession {
  id: string; name: string; username: string; role: string
  domain: string; year: string; email: string
}

function getMemberSession(): MemberSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('ethos_member')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const navItems = [
  { href: '/member/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/member/profile',   icon: User,            label: 'My Profile' },
  { href: '/member/submit',    icon: Send,            label: 'Submit Content' },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [member, setMember] = useState<MemberSession | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Skip layout for login/register pages
  const isPublicPage = pathname === '/member/login' || pathname === '/member/register'

  useEffect(() => {
    if (isPublicPage) return
    const session = getMemberSession()
    if (!session) {
      router.replace('/member/login')
      return
    }
    setMember(session)
  }, [isPublicPage, router])

  if (isPublicPage) return <>{children}</>
  if (!member) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  function handleLogout() {
    sessionStorage.removeItem('ethos_member')
    router.replace('/member/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-60'} flex flex-col bg-card border-r border-border h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold text-sm">
            Et<span className="text-primary">HOS</span>
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">Member Portal</span>
        </div>
      </div>

      {/* Member badge */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{member.name}</p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">{member.role} · {member.year}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
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
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-sm">
            Et<span className="text-primary">HOS</span> Member
          </span>
          <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">
            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

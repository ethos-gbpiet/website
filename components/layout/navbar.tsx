'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Cpu, ChevronDown, User as UserIcon, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/lib/use-site-settings'
import { getCurrentUser, signOut, type Role } from '@/lib/auth'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
  {
    label: 'Projects', href: '/projects',
    children: [
      { href: '/projects', label: 'All Projects' },
      { href: '/projects?status=In+Progress', label: 'Ongoing' },
      { href: '/projects?status=Completed', label: 'Completed' },
    ],
  },
  {
    label: 'Events', href: '/events',
    children: [
      { href: '/events', label: 'All Events' },
      { href: '/events?status=Upcoming', label: 'Upcoming' },
      { href: '/events?status=Past', label: 'Past Events' },
    ],
  },
  { href: '/bulletin', label: 'Bulletin' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null)
  const [mounted, setMounted] = useState(false)
  const s = useSiteSettings()

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
    const onChange = () => setUser(getCurrentUser())
    window.addEventListener('ethos-auth-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('ethos-auth-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isActive = (href: string) => pathname === href

  function handleSignOut() {
    signOut()
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
  }

  const isAdminRole = user && (user.role === 'admin' || user.role === 'super_admin')
  const dashboardHref = isAdminRole ? '/admin/dashboard' : '/member/dashboard'

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-background/85 backdrop-blur-xl border-b border-border shadow-sm'
        : 'bg-transparent'
    )}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-cyan-sm group-hover:border-primary/60 transition-all">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-base tracking-tight">
              {s.siteName.slice(0, 2)}<span className="text-primary">{s.siteName.slice(2)}</span>
            </span>
            <span className="text-[9px] font-mono text-muted-foreground hidden sm:block leading-tight mt-0.5">
              {s.siteTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.label} className="relative"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}>
                <button className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors',
                  pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}>
                  {link.label}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', activeDropdown === link.label ? 'rotate-180' : '')} />
                </button>
                {activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-1 w-48 z-50">
                    <div className="glass rounded-lg shadow-2xl py-1.5 overflow-hidden">
                      {link.children.map((child) => (
                        <Link key={child.href} href={child.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li key={link.href}>
                <Link href={link.href} className={cn(
                  'px-3 py-2 text-sm rounded-md transition-colors animated-underline',
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}>
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
              <Sun className="w-4 h-4 dark:hidden" />
              <Moon className="w-4 h-4 hidden dark:block" />
            </button>
          )}

          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
                <span className="hidden sm:inline text-xs font-medium text-foreground max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass rounded-lg shadow-2xl py-1 z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-wider mt-0.5">{user.role}</p>
                  </div>
                  <Link href={dashboardHref} className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {!isAdminRole && (
                    <Link href="/member/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                      <UserIcon className="w-4 h-4" /> My Profile
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-left border-t border-border mt-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : mounted && (
            <>
              <Link href="/admin/login"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
                <Shield className="w-3 h-3" /> Admin
              </Link>
              <Link href="/member/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-primary/40 bg-primary/5 text-primary rounded-md hover:bg-primary/15 transition-colors">
                Sign In
              </Link>
            </>
          )}

          <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-b border-border">
          <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.label ?? link.href}>
                <Link href={link.href!} className={cn(
                  'block px-3 py-2.5 rounded-md text-sm transition-colors',
                  isActive(link.href!) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border mt-2 pt-2">
              {user ? (
                <Link href={dashboardHref} className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> {isAdminRole ? 'Admin Dashboard' : 'Member Dashboard'}
                </Link>
              ) : (
                <>
                  <Link href="/member/login" className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary" onClick={() => setMobileOpen(false)}>
                    Sign In →
                  </Link>
                  <Link href="/admin/login" className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
                    <Shield className="w-4 h-4" /> Admin Portal
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

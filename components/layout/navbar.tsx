'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Cpu, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/lib/use-site-settings'

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
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const s = useSiteSettings()   // reads from SiteProvider → API → disk

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isActive = (href: string) => pathname === href

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
    )}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-cyan-sm transition-all">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-base tracking-tight">
              {s.siteName.slice(0, 2)}<span className="text-primary">{s.siteName.slice(2)}</span>
            </span>
            <span className="text-[9px] font-mono text-muted-foreground hidden sm:block leading-tight">
              {s.siteTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1">
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
                  <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-xl py-1 z-50">
                    {link.children.map((child) => (
                      <Link key={child.href} href={child.href}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {child.label}
                      </Link>
                    ))}
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
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
            <Sun className="w-4 h-4 dark:hidden" />
            <Moon className="w-4 h-4 hidden dark:block" />
          </button>
          <Link href="/admin/dashboard"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors">
            <span className="status-dot status-active" />
            Admin
          </Link>
          <Link href="/member/login"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
            Member Login
          </Link>
          <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
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
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  isActive(link.href!) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin/dashboard" className="block px-3 py-2 text-sm text-primary" onClick={() => setMobileOpen(false)}>
                Admin Panel →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Cpu, LayoutDashboard, Megaphone, Image, FileText,
  ChevronLeft, ChevronRight, LogOut, BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatorSidebarProps {
  user: { name: string; email: string }
}

const sections = [
  {
    label: 'CONTENT',
    items: [
      { href: '/creator/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/creator/announcements',  icon: Megaphone,       label: 'Announcements' },
      { href: '/creator/gallery',        icon: Image,           label: 'Gallery' },
      { href: '/creator/resources',      icon: FileText,        label: 'Resources & Docs' },
    ],
  },
]

export function CreatorSidebar({ user }: CreatorSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0',
      collapsed ? 'w-14' : 'w-60'
    )}>
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-border min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-violet-400" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="font-display font-bold text-sm truncate">Et<span className="text-primary">HOS</span></span>
            <span className="text-[9px] font-mono text-violet-400/80 mt-0.5">creator studio</span>
          </div>
        )}
        <button onClick={() => setCollapsed(v => !v)} className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">{section.label}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href)
                return (
                  <li key={href}>
                    <Link href={href} title={collapsed ? label : undefined} className={cn(
                      'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                      active ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      collapsed && 'justify-center px-1'
                    )}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[11px] font-bold text-violet-400 shrink-0">
              {initials}
            </span>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <BookOpen className="w-3 h-3 text-violet-400 shrink-0 ml-auto" />
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: '/login' })} title="Sign out" className={cn('w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors', collapsed && 'justify-center')}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}

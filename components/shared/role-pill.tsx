import { Crown, Shield, User as UserIcon, Eye, BookOpen, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/permissions'

const map: Record<Role, { label: string; icon: any; cls: string }> = {
  super_admin: { label: 'Super Admin', icon: Crown,          cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  admin:       { label: 'Admin',       icon: Shield,         cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  faculty:     { label: 'Faculty',     icon: GraduationCap,  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  creator:     { label: 'Creator',     icon: BookOpen,       cls: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  user:        { label: 'Member',      icon: UserIcon,       cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  visitor:     { label: 'Visitor',     icon: Eye,            cls: 'bg-muted text-muted-foreground border-border' },
}

interface RolePillProps {
  role: Role
  className?: string
  withIcon?: boolean
}

/** Compact uppercase pill that visually identifies a user's role. */
export function RolePill({ role, className, withIcon = true }: RolePillProps) {
  const m = map[role]
  const Icon = m.icon
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border',
      m.cls,
      className,
    )}>
      {withIcon && <Icon className="w-3 h-3" />}
      {m.label}
    </span>
  )
}

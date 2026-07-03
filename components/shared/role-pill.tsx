import {
  Crown, Shield, User as UserIcon, Eye, BookOpen, GraduationCap,
  Building2, Star, Wrench, CalendarDays, PenLine, Palette, UserCog
} from 'lucide-react'
import { cn } from '@/lib/utils'

const map: Record<string, { label: string; icon: any; cls: string }> = {
  hod:                 { label: 'HOD',               icon: Building2,     cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  faculty_coordinator: { label: 'Faculty Coord.',    icon: GraduationCap, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  super_admin:         { label: 'Super Admin',       icon: Crown,         cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  admin:               { label: 'Admin',             icon: Shield,        cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  faculty:             { label: 'Faculty',           icon: GraduationCap, cls: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  technical_lead:      { label: 'Technical Lead',   icon: Wrench,        cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  events_lead:         { label: 'Events Lead',      icon: CalendarDays,  cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  content_lead:        { label: 'Content Lead',     icon: PenLine,       cls: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  design_lead:         { label: 'Design Lead',      icon: Palette,       cls: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' },
  core:                { label: 'Core Committee',   icon: Star,          cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  creator:             { label: 'Creator',          icon: BookOpen,      cls: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  user:                { label: 'Member',           icon: UserIcon,      cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  member:              { label: 'Member',           icon: UserIcon,      cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  coordinator:         { label: 'Coordinator',      icon: UserCog,       cls: 'bg-lime-500/10 text-lime-400 border-lime-500/30' },
  visitor:             { label: 'Visitor',          icon: Eye,           cls: 'bg-muted text-muted-foreground border-border' },
}

interface RolePillProps {
  role: string
  className?: string
  withIcon?: boolean
}

export function RolePill({ role, className, withIcon = true }: RolePillProps) {
  const m = map[role] ?? { label: role, icon: UserIcon, cls: 'bg-muted text-muted-foreground border-border' }
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

export const ALL_ROLES: { value: string; label: string }[] = [
  { value: 'hod',                 label: 'HOD (Head of Department)' },
  { value: 'faculty_coordinator', label: 'Faculty Coordinator' },
  { value: 'super_admin',         label: 'Super Admin' },
  { value: 'admin',               label: 'Admin' },
  { value: 'faculty',             label: 'Faculty' },
  { value: 'technical_lead',      label: 'Technical Lead' },
  { value: 'events_lead',         label: 'Events Lead' },
  { value: 'content_lead',        label: 'Content Lead' },
  { value: 'design_lead',         label: 'Design Lead' },
  { value: 'core',                label: 'Core Committee' },
  { value: 'coordinator',         label: 'Coordinator' },
  { value: 'creator',             label: 'Creator' },
  { value: 'user',                label: 'Member' },
  { value: 'visitor',             label: 'Visitor' },
]

export const ROLE_RANK: Record<string, number> = {
  hod: 10, faculty_coordinator: 20, faculty: 30,
  super_admin: 40, admin: 50,
  technical_lead: 60, events_lead: 60, content_lead: 60, design_lead: 60,
  core: 70, coordinator: 70,
  creator: 80, user: 90, member: 90,
  visitor: 100,
}

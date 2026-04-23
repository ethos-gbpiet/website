'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, ChevronRight, Users, FileText } from 'lucide-react'
import { TeamMember, defaultTeam } from '@/lib/store'

// ─── Domain colour map ────────────────────────────────────────────────────────
const domainColor: Record<string, string> = {
  'Faculty':           'bg-primary/10 text-primary border-primary/25',
  'VLSI & Embedded':   'bg-primary/10 text-primary border-primary/25',
  'FPGA & Digital':    'bg-sky-400/10 text-sky-400 border-sky-400/20',
  'Embedded Systems':  'bg-violet-400/10 text-violet-400 border-violet-400/20',
  'Power Electronics': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  'RF & Wireless':     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  'PCB Design':        'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  'Signal Processing': 'bg-pink-400/10 text-pink-400 border-pink-400/20',
  'Management':        'bg-slate-400/10 text-slate-400 border-slate-400/20',
  'Events':            'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

// ─── Avatar — initials only, zero img/onError ─────────────────────────────────
function Avatar({ member, size = 'md' }: { member: TeamMember; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = { sm: 40, md: 56, lg: 80, xl: 112 }
  const px = sizeMap[size]
  const colours = [
    'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
    'bg-violet-400/15 text-violet-300 border-violet-400/30',
    'bg-amber-400/15 text-amber-300 border-amber-400/30',
    'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    'bg-pink-400/15 text-pink-300 border-pink-400/30',
    'bg-sky-400/15 text-sky-300 border-sky-400/30',
    'bg-orange-400/15 text-orange-300 border-orange-400/30',
  ]
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const idx = (member.name.charCodeAt(0) + (member.name.charCodeAt(1) || 0)) % colours.length
  const fontSize = px < 50 ? 12 : px < 70 ? 15 : px < 90 ? 18 : 24

  if (member.photo) {
    return (
      <div className="rounded-full overflow-hidden border-2 border-primary/30 shrink-0"
        style={{ width: px, height: px }}>
        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={`${colours[idx]} rounded-full border-2 flex items-center justify-center font-display font-bold shrink-0 select-none`}
      style={{ width: px, height: px, fontSize }}>
      {initials}
    </div>
  )
}

// ─── Social links row ─────────────────────────────────────────────────────────
function SocialRow({ member, compact = false }: { member: TeamMember; compact?: boolean }) {
  const links = [
    member.github   && { href: member.github,           Icon: Github,   label: 'GitHub',   hover: 'hover:text-foreground' },
    member.linkedin && { href: member.linkedin,          Icon: Linkedin, label: 'LinkedIn', hover: 'hover:text-sky-400' },
    member.email    && { href: `mailto:${member.email}`, Icon: Mail,     label: 'Email',    hover: 'hover:text-primary' },
  ].filter(Boolean) as { href: string; Icon: React.ElementType; label: string; hover: string }[]

  if (!links.length) return null
  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'mt-auto pt-3'}`}>
      {links.map(({ href, Icon, label, hover }) => (
        <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer" aria-label={label}
          className={`p-1.5 rounded-md border border-border text-muted-foreground ${hover} hover:bg-muted transition-all duration-200 hover:scale-110`}>
          <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </a>
      ))}
    </div>
  )
}

// ─── Card variants ────────────────────────────────────────────────────────────

function FacultyCard({ member }: { member: TeamMember }) {
  return (
    <Link href={`/team/${member.id}`} className="group block">
      <div className="bg-card border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start hover:border-primary/40 transition-all duration-300">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
          <Avatar member={member} size="xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">{member.name}</h3>
            {member.featured && <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/25">Coordinator</span>}
          </div>
          <p className="text-sm font-semibold text-primary mb-0.5">{member.role}</p>
          <p className="text-xs text-muted-foreground font-mono mb-3">{member.year}</p>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${domainColor[member.domain] ?? 'bg-muted/50 text-muted-foreground border-border'} inline-block mb-3`}>
            {member.domain}
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">{member.bio}</p>
          {member.resume && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 mb-3">
              <FileText className="w-3 h-3" /> Resume available — click to view
            </span>
          )}
          <SocialRow member={member} />
        </div>
      </div>
    </Link>
  )
}

function LeaderCard({ member }: { member: TeamMember }) {
  return (
    <Link href={`/team/${member.id}`} className="group block">
      <div className="bg-card border border-border rounded-2xl p-7 flex flex-col items-center text-center hover:border-primary/35 transition-all duration-300 card-hover h-full">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
          <Avatar member={member} size="xl" />
        </div>
        <h3 className="font-display font-bold text-lg mb-0.5 group-hover:text-primary transition-colors">{member.name}</h3>
        <p className="text-sm text-primary font-semibold mb-0.5">{member.role}</p>
        <p className="text-[11px] font-mono text-muted-foreground mb-2">{member.year}</p>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border mb-4 ${domainColor[member.domain] ?? 'bg-muted/50 text-muted-foreground border-border'}`}>
          {member.domain}
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{member.bio}</p>
        {member.resume && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 mb-3">
            <FileText className="w-3 h-3" /> Resume available
          </span>
        )}
        <SocialRow member={member} />
      </div>
    </Link>
  )
}

function StandardCard({ member }: { member: TeamMember }) {
  return (
    <Link href={`/team/${member.id}`} className="group block h-full">
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col hover:border-primary/30 transition-all duration-300 card-hover h-full">
        <div className="flex items-start gap-3 mb-4">
          <Avatar member={member} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{member.name}</h3>
            <p className="text-xs text-primary font-mono mt-0.5">{member.role}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{member.year}</p>
          </div>
        </div>
        <span className={`self-start text-[10px] font-mono px-2 py-0.5 rounded border mb-3 ${domainColor[member.domain] ?? 'bg-muted/50 text-muted-foreground border-border'}`}>
          {member.domain}
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{member.bio}</p>
        {member.resume && (
          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono text-red-400">
            <FileText className="w-2.5 h-2.5" /> Resume available
          </span>
        )}
        <SocialRow member={member} />
      </div>
    </Link>
  )
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <Link href={`/team/${member.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5">
        <Avatar member={member} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{member.name}</h3>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${domainColor[member.domain] ?? 'bg-muted/50 text-muted-foreground border-border'}`}>
              {member.domain.split(' ')[0]}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">{member.year}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">{member.bio}</p>
          {member.resume && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-mono text-red-400">
              <FileText className="w-2.5 h-2.5" /> Resume available
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Year group divider ───────────────────────────────────────────────────────
function YearBadge({ year, count }: { year: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono font-semibold text-primary">{year}</span>
        <span className="text-xs font-mono text-muted-foreground">· {count}</span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────
function Section({ label, title, count, children }: {
  label: string; title: string; count?: number; children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-7">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-0.5">{label}</p>
          <h2 className="text-2xl font-display font-bold">{title}</h2>
        </div>
        {count !== undefined && (
          <span className="ml-auto text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">{count}</span>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [domainFilter, setDomainFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/team', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setTeam(Array.isArray(data) && data.length > 0 ? data : defaultTeam)
        } else {
          setTeam(defaultTeam)
        }
      } catch {
        setTeam(defaultTeam)
      }
    }
    load()
  }, [])

  // Derived groups
  const faculty    = team.filter(m => m.section === 'faculty')
  const leadership = team.filter(m => m.section === 'leadership')
  const core       = team.filter(m => m.section === 'core')
  const technical  = team.filter(m => m.section === 'technical')
  const events     = team.filter(m => m.section === 'events')
  const allMembers = team.filter(m => m.section === 'member')

  // Members: sort by yearNum descending (4 → 3 → 2 → 1), then name
  const sortedMembers = [...allMembers].sort((a, b) =>
    b.yearNum !== a.yearNum ? b.yearNum - a.yearNum : a.name.localeCompare(b.name)
  )

  // Group members by year label
  const membersByYear = sortedMembers.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const key = m.yearNum === 1 ? '1st Year'
      : m.yearNum === 2 ? '2nd Year'
      : m.yearNum === 3 ? '3rd Year'
      : m.yearNum === 4 ? '4th Year'
      : 'Faculty / Staff'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})
  const yearOrder = ['4th Year', '3rd Year', '2nd Year', '1st Year']

  // Domain filter options for members
  const memberDomains = ['All', ...Array.from(new Set(allMembers.map(m => m.domain))).sort()]

  const filteredMembersByYear = Object.fromEntries(
    Object.entries(membersByYear).map(([year, list]) => [
      year,
      domainFilter === 'All' ? list : list.filter(m => m.domain === domainFilter),
    ])
  )

  return (
    <div className="pt-20">
      {/* ── Header ── */}
      <section className="relative py-16 bg-grid overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="absolute -top-20 right-0 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">// the_team</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 max-w-2xl leading-tight">
            The minds behind <span className="gradient-text text-glow">EtHOS</span>
          </h1>
          <p className="text-muted-foreground max-w-xl leading-relaxed text-lg mb-8">
            From faculty coordinators to first-year members — meet the engineers, designers, and builders
            who make EtHOS the best place to do hardware at IET College.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { n: faculty.length,    label: 'Faculty' },
              { n: leadership.length, label: 'Leadership' },
              { n: core.length,       label: 'Core team' },
              { n: technical.length,  label: 'Tech leads' },
              { n: events.length,     label: 'Event team' },
              { n: allMembers.length, label: 'Members' },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center gap-2 bg-card/70 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
                <span className="text-lg font-display font-bold text-primary">{n}</span>
                <span className="text-xs text-muted-foreground font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-14">

        {/* 1 ── Associated Faculty & Mentors (always at the very top) ── */}
        {faculty.length > 0 && (
          <Section label="// faculty_mentors" title="Associated Faculty & Mentors" count={faculty.length}>
            <div className="grid gap-4">
              {faculty.map(m => <FacultyCard key={m.id} member={m} />)}
            </div>
          </Section>
        )}

        {/* 2 ── Leadership ── */}
        {leadership.length > 0 && (
          <Section label="// leadership" title="President & Vice President" count={leadership.length}>
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
              {leadership.map(m => <LeaderCard key={m.id} member={m} />)}
            </div>
          </Section>
        )}

        {/* 3 ── Core Committee ── */}
        {core.length > 0 && (
          <Section label="// core_team" title="Core Committee" count={core.length}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {core.map(m => <StandardCard key={m.id} member={m} />)}
            </div>
          </Section>
        )}

        {/* 4 ── Technical Leads ── */}
        {technical.length > 0 && (
          <Section label="// technical_leads" title="Technical Domain Leads" count={technical.length}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {technical.map(m => <StandardCard key={m.id} member={m} />)}
            </div>
          </Section>
        )}

        {/* 5 ── Events & Outreach ── */}
        {events.length > 0 && (
          <Section label="// events_outreach" title="Events & Outreach Team" count={events.length}>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
              {events.map(m => <StandardCard key={m.id} member={m} />)}
            </div>
          </Section>
        )}

        {/* 6 ── Active Members — sorted 4th→3rd→2nd→1st ── */}
        {allMembers.length > 0 && (
          <Section label="// active_members" title="Active Members" count={allMembers.length}>
            {/* Domain filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {memberDomains.map(d => (
                <button key={d} onClick={() => setDomainFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                    domainFilter === d
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                  }`}>
                  {d}
                </button>
              ))}
            </div>

            {/* Year groups: 4th → 3rd → 2nd → 1st */}
            <div className="space-y-8">
              {yearOrder.map(year => {
                const list = filteredMembersByYear[year]
                if (!list || list.length === 0) return null
                return (
                  <div key={year}>
                    <YearBadge year={year} count={list.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {list.map(m => <MemberCard key={m.id} member={m} />)}
                    </div>
                  </div>
                )
              })}
            </div>

            {Object.values(filteredMembersByYear).every(l => l.length === 0) && (
              <p className="text-center py-16 text-muted-foreground text-sm">No members in this domain.</p>
            )}
          </Section>
        )}

        {/* ── Join CTA ── */}
        <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.025] p-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
          <div className="relative">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">// join_us</p>
            <h2 className="text-3xl font-display font-bold mb-3">Want to be part of the team?</h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">
              EtHOS recruits every semester. No prior experience required — just curiosity
              and a willingness to pick up a soldering iron.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/collaborate?type=join"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 transition-all duration-200 glow-cyan shadow-lg shadow-primary/20">
                Apply to join <ChevronRight className="w-4 h-4" />
              </a>
              <a href="mailto:ethos@iet.edu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-card/60 text-sm font-medium hover:bg-muted hover:border-primary/30 transition-all duration-200">
                <Mail className="w-4 h-4" /> Email us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

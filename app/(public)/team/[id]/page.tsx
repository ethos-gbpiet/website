'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Github, Linkedin, Mail, FileText,
  Download, ExternalLink, Cpu, Instagram, Globe, Twitter,
} from 'lucide-react'
import { TeamMember, defaultTeam } from '@/lib/store'

const domainColor: Record<string, string> = {
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

function Avatar({ member }: { member: TeamMember }) {
  const colours = [
    'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
    'bg-violet-400/15 text-violet-300 border-violet-400/30',
    'bg-amber-400/15 text-amber-300 border-amber-400/30',
    'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    'bg-pink-400/15 text-pink-300 border-pink-400/30',
    'bg-sky-400/15 text-sky-300 border-sky-400/30',
  ]
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const idx = (member.name.charCodeAt(0) + (member.name.charCodeAt(1) || 0)) % colours.length
  if (member.photo) {
    return (
      <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/30 shrink-0">
        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className={`w-32 h-32 rounded-2xl border-2 flex items-center justify-center font-display font-bold text-4xl select-none shrink-0 ${colours[idx]}`}>
      {initials}
    </div>
  )
}

const sectionLabel: Record<string, string> = {
  faculty:    'Faculty / Mentor',
  leadership: 'Leadership',
  core:       'Core Committee',
  technical:  'Technical Lead',
  events:     'Events Team',
  member:     'Active Member',
  ex_member:  'Alumni / Ex-Member',
}

export default function MemberProfilePage() {
  const params = useParams()
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResume, setShowResume] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [res, exRes] = await Promise.all([
          fetch('/api/team', { cache: 'no-store' }),
          fetch('/api/team?ex=1', { cache: 'no-store' }),
        ])
        const active: TeamMember[] = res.ok ? await res.json() : []
        const alumni: TeamMember[] = exRes.ok ? await exRes.json() : []
        const all = [...(active.length ? active : defaultTeam), ...alumni]
        const found = all.find(m => m.id === params.id)
        if (found) setMember(found)
      } catch { /* keep null */ }
      finally { setLoading(false) }
    }
    load()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!member) return (
    <div className="min-h-screen flex items-center justify-center pt-20 text-center px-4">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-6">
          <Cpu className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Member not found</h1>
        <p className="text-muted-foreground mb-6">This profile doesn&apos;t exist or may have been removed.</p>
        <Link href="/team" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
      </div>
    </div>
  )

  const isExMember = (member as any).exMember === true

  const socials = [
    member.github    && { href: member.github,            Icon: Github,    label: 'GitHub' },
    member.linkedin  && { href: member.linkedin,          Icon: Linkedin,  label: 'LinkedIn' },
    (member as any).instagram && { href: (member as any).instagram, Icon: Instagram, label: 'Instagram' },
    (member as any).twitter   && { href: (member as any).twitter,   Icon: Twitter,   label: 'Twitter / X' },
    (member as any).website   && { href: (member as any).website,   Icon: Globe,     label: 'Website' },
    member.email     && { href: `mailto:${member.email}`,  Icon: Mail,      label: member.email },
  ].filter(Boolean) as { href: string; Icon: React.ElementType; label: string }[]

  return (
    <div className="pt-20 min-h-screen">
      <section className="relative py-14 bg-grid overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Link href="/team" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Team
          </Link>
          <div className="flex flex-col sm:flex-row gap-7 items-start">
            <div className="relative">
              <Avatar member={member} />
              {isExMember && (
                <span className="absolute -top-2 -right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-full border bg-muted/80 text-muted-foreground border-border">Alumni</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {sectionLabel[member.section] ?? member.section}
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1 mb-0.5">{member.name}</h1>
              <p className="text-primary font-semibold text-lg mb-0.5">{member.role}</p>
              <p className="text-muted-foreground font-mono text-sm mb-1">{member.year}</p>
              {isExMember && (member as any).exitYear && (
                <p className="text-[11px] font-mono text-muted-foreground/70 mb-3">
                  Served until {(member as any).exitYear}
                  {(member as any).exitReason && ` · ${(member as any).exitReason}`}
                </p>
              )}
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded border inline-block mb-5 ${domainColor[member.domain] ?? 'bg-muted text-muted-foreground border-border'}`}>
                {member.domain}
              </span>
              {socials.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {socials.map(({ href, Icon, label }) => (
                    <a key={label} href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted transition-all">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-bold text-lg mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>

            {member.resume ? (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-red-400">PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{member.name}&apos;s Resume / CV</p>
                      <p className="text-[11px] text-muted-foreground font-mono">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowResume(v => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      {showResume ? 'Hide' : 'View'} Resume
                    </button>
                    <a href={member.resume}
                      download={`${member.name.replace(/\s+/g, '_')}_Resume.pdf`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/85 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
                {showResume && (
                  <iframe src={member.resume} title={`${member.name} Resume`}
                    className="w-full" style={{ height: '80vh', border: 'none' }} />
                )}
                {!showResume && (
                  <div className="p-8 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Click &quot;View Resume&quot; to open the PDF inline, or download it directly.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No resume uploaded for this member yet.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Details</h3>
              <dl className="space-y-3">
                {[
                  { label: 'Role',   value: member.role },
                  { label: 'Year',   value: member.year },
                  { label: 'Domain', value: member.domain },
                  { label: 'Team',   value: sectionLabel[member.section] ?? member.section },
                  ...(isExMember && (member as any).exitYear ? [{ label: 'Served Until', value: (member as any).exitYear }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</dt>
                    <dd className="text-sm font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {(member.email || member.github || member.linkedin || (member as any).instagram) && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Connect</h3>
                <div className="space-y-2">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="w-4 h-4 shrink-0 text-primary" />{member.email}
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Github className="w-4 h-4 shrink-0" />GitHub Profile<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-sky-400 transition-colors">
                      <Linkedin className="w-4 h-4 shrink-0" />LinkedIn Profile<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  )}
                  {(member as any).instagram && (
                    <a href={(member as any).instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-pink-400 transition-colors">
                      <Instagram className="w-4 h-4 shrink-0" />Instagram<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <Link href="/team" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted hover:border-primary/30 transition-all">
              <ArrowLeft className="w-4 h-4" /> All Team Members
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

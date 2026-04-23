'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ChevronRight, Cpu, Zap, Code2, Radio,
  Activity, Wifi, Battery, Settings, Server,
  MapPin, Users, Pin, Trophy, Award, Handshake,
  BookOpen, ExternalLink, Mail, Clock, Github,
  Twitter, Linkedin, Layers,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/use-site-settings'

// ─── Animation hooks ──────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function useCounter(target: number, active: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = 50
    const timer = setInterval(() => {
      frame++
      const ease = 1 - Math.pow(1 - frame / total, 3)
      setVal(Math.round(ease * target))
      if (frame >= total) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [active, target])
  return val
}

// ─── Circuit board SVG background ────────────────────────────────────────────

function CircuitPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="circuit-tile" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <line x1="0" y1="60" x2="52" y2="60" stroke="#00E5FF" strokeWidth="0.6" opacity="0.35" />
          <circle cx="60" cy="60" r="4" fill="none" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
          <circle cx="60" cy="60" r="1.5" fill="#00E5FF" opacity="0.5" />
          <line x1="68" y1="60" x2="120" y2="60" stroke="#00E5FF" strokeWidth="0.6" opacity="0.35" />
          <line x1="60" y1="68" x2="60" y2="120" stroke="#00E5FF" strokeWidth="0.6" opacity="0.35" />
          <line x1="0" y1="0" x2="0" y2="24" stroke="#00E5FF" strokeWidth="0.6" opacity="0.18" />
          <line x1="0" y1="24" x2="24" y2="24" stroke="#00E5FF" strokeWidth="0.6" opacity="0.18" />
          <circle cx="24" cy="24" r="2" fill="none" stroke="#00E5FF" strokeWidth="0.6" opacity="0.25" />
          <rect x="90" y="90" width="10" height="5" rx="1" fill="none" stroke="#00E5FF" strokeWidth="0.6" opacity="0.22" />
          <line x1="90" y1="92.5" x2="72" y2="92.5" stroke="#00E5FF" strokeWidth="0.6" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-tile)" />
    </svg>
  )
}

// ─── Stat counter card ────────────────────────────────────────────────────────

function StatCard({ value, suffix, label, active, delay = 0 }: { value: number; suffix: string; label: string; active: boolean; delay?: number }) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setGo(true), delay)
    return () => clearTimeout(t)
  }, [active, delay])
  const count = useCounter(value, go)
  return (
    <div className="bg-card/70 backdrop-blur-sm border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group"
      style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, border-color 0.3s` }}>
      <p className="text-3xl font-display font-bold text-primary group-hover:text-glow transition-all">{count}{suffix}</p>
      <p className="text-xs text-muted-foreground mt-1 font-mono">{label}</p>
    </div>
  )
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={className}
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const domains = [
  { icon: Cpu,      label: 'PCB Design',        color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/20' },
  { icon: Code2,    label: 'Embedded Systems',  color: 'text-violet-400',  bg: 'bg-violet-400/10 border-violet-400/20' },
  { icon: Zap,      label: 'Power Electronics', color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' },
  { icon: Radio,    label: 'RF & Wireless',     color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { icon: Activity, label: 'Signal Processing', color: 'text-pink-400',    bg: 'bg-pink-400/10 border-pink-400/20' },
  { icon: Layers,   label: 'FPGA & Digital',    color: 'text-sky-400',     bg: 'bg-sky-400/10 border-sky-400/20' },
]

const announcements = [
  { id:1, pinned:true,  title:'Hardware Hackathon 2025 — registrations open',  body:'Build a working hardware prototype in 36 hours. Rs.50,000 prize pool. 144 spots remaining.', category:'Event',       cat:'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',         dot:'bg-emerald-400', date:'Mar 15' },
  { id:2, pinned:true,  title:'New project: Open-source Digital Oscilloscope', body:'Seeking members with analog frontend design, STM32, or LVGL display experience.',            category:'Recruitment', cat:'bg-violet-400/10 text-violet-400 border-violet-400/20',   dot:'bg-violet-400',  date:'Mar 12' },
  { id:3, pinned:false, title:'KiCad Bootcamp — 2 seats remaining',            body:'March 28-29, Electronics Lab. From schematic to fabrication order in two days. Rs.200.',    category:'Urgent',      cat:'bg-amber-400/10 text-amber-400 border-amber-400/20',       dot:'bg-amber-400',   date:'Mar 14' },
  { id:4, pinned:false, title:'EtHOS wins IEEE Hardware Design Challenge',      body:'RISC-V team placed 1st at regional IEEE Student Hardware Design Challenge. On to nationals!', category:'Win',         cat:'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', dot:'bg-cyan-400',    date:'Feb 18' },
]

const projects = [
  { id:'risc-v-core',  title:'32-bit RISC-V Processor Core',   tagline:'Custom 5-stage pipelined processor with hardware multiply in Verilog', category:'FPGA & Digital',    status:'In Progress', progress:65,  tech:['Verilog','Xilinx','ModelSim'], grad:'from-sky-400/15 to-sky-400/5',     tagC:'bg-sky-400/10 text-sky-400 border-sky-400/20',         stC:'bg-amber-400/10 text-amber-400 border-amber-400/20',   bar:'bg-sky-400' },
  { id:'class-d-amp',  title:'100W Class-D Amplifier',          tagline:'High-efficiency switching amplifier with custom gate driver PCB',      category:'Power Electronics', status:'Completed',   progress:100, tech:['KiCad','LTSpice','GaN FETs'], grad:'from-amber-400/15 to-amber-400/5', tagC:'bg-amber-400/10 text-amber-400 border-amber-400/20',   stC:'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', bar:'bg-amber-400' },
  { id:'lora-mesh',    title:'LoRa Mesh Sensor Network',         tagline:'12-node autonomous mesh for sub-GHz IoT sensor aggregation',          category:'RF & Wireless',     status:'In Progress', progress:48,  tech:['ESP32','SX1276','FreeRTOS'],  grad:'from-emerald-400/15 to-emerald-400/5', tagC:'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', stC:'bg-amber-400/10 text-amber-400 border-amber-400/20', bar:'bg-emerald-400' },
]

const events = [
  { id:'pcb-bootcamp',  title:'KiCad PCB Design Bootcamp',      day:'28', month:'Mar', venue:'Electronics Lab, Block C',    category:'Workshop',  registered:38,  capacity:40,  fee:'Rs.200',  status:'Upcoming', accent:'border-l-amber-400' },
  { id:'soldering-ws',  title:'SMD Soldering & Rework Workshop', day:'06', month:'Apr', venue:'PCB Lab, Innovation Block',   category:'Workshop',  registered:19,  capacity:30,  fee:'Rs.150',  status:'Upcoming', accent:'border-l-emerald-400' },
  { id:'hw-hackathon',  title:'Hardware Hackathon 2025',         day:'18', month:'Apr', venue:'Main Auditorium & Makerspace', category:'Hackathon', registered:287, capacity:400, fee:'Rs.300',  status:'Flagship', accent:'border-l-cyan-400' },
]

const achievements = [
  { icon:Trophy,    title:'1st at IEEE Hardware Design Challenge',   body:'Regional champions in student hardware design. Advancing to national finals.',       accent:'text-cyan-400',    bg:'bg-cyan-400/10 border-cyan-400/20' },
  { icon:Award,     title:'Best Hardware — Smart India Hackathon',   body:'Custom biosignal acquisition PCB awarded Best Hardware at SIH 2024.',              accent:'text-amber-400',   bg:'bg-amber-400/10 border-amber-400/20' },
  { icon:Handshake, title:'Texas Instruments University Program',    body:'Official TI University member — free ICs, reference designs, and dev kits.',       accent:'text-violet-400',  bg:'bg-violet-400/10 border-violet-400/20' },
  { icon:BookOpen,  title:'300+ PCBs fabricated in-lab',             body:'In-house PCB manufacturing with same-day prototype turnaround for all members.',    accent:'text-emerald-400', bg:'bg-emerald-400/10 border-emerald-400/20' },
]

// contactDetails is now built dynamically inside ContactSection from useSiteSettings()

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const s = useSiteSettings()
  const [statsRef, statsInView] = useInView(0.3)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  // heroHeading is an array like ['Design.', 'Build.', 'Power.']
  const words = s.heroHeading.length > 0 ? s.heroHeading : ['Design.', 'Build.', 'Power.']

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <CircuitPattern />
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute -top-32 right-0 w-[600px] h-[600px] bg-violet-600/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-amber-400/4 rounded-full blur-[60px] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px opacity-20 animate-scan-line"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #00E5FF 40%, #00E5FF 60%, transparent 100%)' }} />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-8"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-10px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary tracking-wide">{s.siteTagline} — {s.collegeFullName}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-display font-extrabold tracking-tight leading-[1.04] mb-6">
              {words.map((word, i) => (
                <span key={i} className="block"
                  style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.55s ease ${80 + i * 120}ms, transform 0.55s ease ${80 + i * 120}ms` }}>
                  {i === 1 ? <span className="gradient-text text-glow">{word}</span> : word}
                </span>
              ))}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-[460px]"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.6s ease 460ms, transform 0.6s ease 460ms' }}>
              {s.heroSubtext}
            </p>

            <div className="flex flex-wrap gap-3"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.6s ease 580ms, transform 0.6s ease 580ms' }}>
              <Link href="/projects" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 transition-all duration-200 glow-cyan shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98]">
                Explore projects <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/collaborate" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-sm font-medium hover:bg-muted hover:border-primary/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Join {s.siteName}
              </Link>
            </div>
          </div>

          <div ref={statsRef} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={120} suffix="+" label="Active members"   active={statsInView} delay={0} />
              <StatCard value={42}  suffix=""  label="PCBs designed"    active={statsInView} delay={100} />
              <StatCard value={28}  suffix="+" label="Projects shipped" active={statsInView} delay={200} />
              <StatCard value={12}  suffix=""  label="Awards won"       active={statsInView} delay={300} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {domains.map(({ icon: Icon, label, color, bg }, i) => (
                <div key={label} className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border ${bg} hover:scale-[1.04] transition-all duration-200 cursor-default`}
                  style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? 'translateY(0)' : 'translateY(14px)', transition: `opacity 0.45s ease ${400 + i * 70}ms, transform 0.45s ease ${400 + i * 70}ms` }}>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-35 pointer-events-none">
        <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection() {
  const s = useSiteSettings()
  const pillars = [
    { icon:Cpu,      title:'Hardware first',      body:'Every project starts with a schematic. We build real, tangible electronics — not just simulations.' },
    { icon:Users,    title:'Peer-led learning',   body:`Senior members mentor juniors through every build. No prior experience required to join ${s.siteName}.` },
    { icon:Settings, title:'Full-stack hardware', body:'From analog front-ends to firmware, RF to power supply — we cover every layer of the hardware stack.' },
    { icon:Trophy,   title:'Compete nationally',  body:'We field teams in IEEE, Smart India Hackathon, Robocon, and embedded systems challenges every year.' },
  ]
  return (
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <Reveal>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">// about_{s.siteName.toLowerCase()}</p>
            <h2 className="text-3xl font-display font-bold mb-5 leading-tight">
              {s.aboutTitle.includes(' ') ? (
                <>
                  {s.aboutTitle.split(' ').slice(0, Math.ceil(s.aboutTitle.split(' ').length / 2)).join(' ')}{' '}
                  <span className="gradient-text">{s.aboutTitle.split(' ').slice(Math.ceil(s.aboutTitle.split(' ').length / 2)).join(' ')}</span>
                </>
              ) : (
                <span className="gradient-text">{s.aboutTitle}</span>
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-7">
              {s.aboutBody}
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all duration-200 font-semibold">
              Our story and mission <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-3">
            {pillars.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/35 transition-all duration-300 card-hover h-full group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/18 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Announcements ────────────────────────────────────────────────────────────

function AnnouncementsSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">// bulletin_board</p>
              <h2 className="text-3xl font-display font-bold">Latest announcements</h2>
            </div>
            <Link href="/bulletin" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-2.5">
          {announcements.map((ann, i) => (
            <Reveal key={ann.id} delay={i * 60}>
              <div className={`group flex items-start gap-4 p-5 rounded-xl border bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer hover:translate-x-1 ${ann.pinned ? 'border-primary/15 bg-primary/[0.02]' : 'border-border'}`}>
                <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${ann.dot}`} />
                  {ann.pinned && <Pin className="w-2.5 h-2.5 text-primary/60" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug mb-0.5 group-hover:text-primary transition-colors">{ann.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{ann.body}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${ann.cat}`}>{ann.category}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{ann.date}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function ProjectsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">// featured_builds</p>
              <h2 className="text-3xl font-display font-bold">What we are building</h2>
            </div>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              All projects <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <Link href={`/projects/${p.id}`} className="group block h-full">
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 card-hover h-full">
                  <div className={`h-32 bg-gradient-to-br ${p.grad} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-grid opacity-25" />
                    {[{x:'15%',y:'30%',s:3},{x:'42%',y:'62%',s:2},{x:'70%',y:'22%',s:3},{x:'85%',y:'70%',s:2}].map((dot, di) => (
                      <div key={di} className="absolute rounded-full opacity-35 group-hover:opacity-65 transition-opacity"
                        style={{ left:dot.x, top:dot.y, width:dot.s*4, height:dot.s*4, background:'rgba(0,229,255,0.6)', borderRadius:'50%' }} />
                    ))}
                    <div className="absolute bottom-3 left-4 flex gap-1.5 flex-wrap">
                      {p.tech.map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-background/75 backdrop-blur-sm border border-border text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-2 justify-between mb-2">
                      <p className="font-display font-bold text-sm leading-tight flex-1 group-hover:text-primary transition-colors">{p.title}</p>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${p.stC}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.tagline}</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Completion</span><span>{p.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.bar} transition-all duration-1000`} style={{ width:`${p.progress}%` }} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${p.tagC}`}>{p.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Events ───────────────────────────────────────────────────────────────────

function EventsSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">// upcoming_events</p>
              <h2 className="text-3xl font-display font-bold">What is happening</h2>
            </div>
            <Link href="/events" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              All events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="flex flex-col gap-3">
          {events.map((ev, i) => {
            const pct = Math.round((ev.registered / ev.capacity) * 100)
            const almost = pct >= 88
            return (
              <Reveal key={ev.id} delay={i * 80}>
                <Link href={`/events/${ev.id}`} className="group block">
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-card border border-border rounded-xl border-l-[3px] ${ev.accent} hover:border-primary/25 transition-all duration-300 hover:translate-x-1`}>
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-muted border border-border flex flex-col items-center justify-center">
                      <span className="text-xl font-display font-bold leading-none">{ev.day}</span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">{ev.month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{ev.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                          {ev.status === 'Flagship' ? 'Flagship' : ev.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-2">
                        <span className="flex items-center gap-1 font-mono"><MapPin className="w-3 h-3" />{ev.venue}</span>
                        <span className={`flex items-center gap-1 font-mono ${almost ? 'text-amber-400' : ''}`}>
                          <Users className="w-3 h-3" />{ev.registered}/{ev.capacity}{almost && ' · almost full'}
                        </span>
                      </div>
                      <div className="h-1 w-full max-w-[240px] bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${almost ? 'bg-amber-400' : 'bg-primary'}`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-muted-foreground">{ev.fee}</span>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 text-primary text-xs font-semibold bg-primary/5 group-hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-200">
                        Register <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal className="text-center mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">// milestones</p>
          <h2 className="text-3xl font-display font-bold">Achievements and highlights</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map(({ icon: Icon, title, body, accent, bg }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/35 transition-all duration-300 card-hover group h-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${accent}`} />
                </div>
                <p className="font-display font-bold text-sm mb-2 leading-snug group-hover:text-primary transition-colors">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Collaborate CTA ─────────────────────────────────────────────────────────

function CollaborateSection() {
  const tiles = [
    { href:'/collaborate?type=join',    label:'Join as member',    sub:'Apply for a domain team',      c:'border-cyan-400/30 hover:bg-cyan-400/5 hover:border-cyan-400/50' },
    { href:'/collaborate?type=propose', label:'Propose a project', sub:'Pitch your own hardware idea',  c:'border-violet-400/30 hover:bg-violet-400/5 hover:border-violet-400/50' },
    { href:'/collaborate?type=sponsor', label:'Sponsor / partner', sub:'Fund lab, events, prizes',     c:'border-amber-400/30 hover:bg-amber-400/5 hover:border-amber-400/50' },
    { href:'/collaborate?type=mentor',  label:'Become a mentor',   sub:'Guide as alumni or industry',  c:'border-emerald-400/30 hover:bg-emerald-400/5 hover:border-emerald-400/50' },
  ]
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.025] overflow-hidden p-12 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><CircuitPattern /></div>
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">// collaborate_with_us</p>
              <h2 className="text-4xl font-display font-bold mb-4">
                Ready to build something <span className="gradient-text">that matters?</span>
              </h2>
              <p className="text-muted-foreground max-w-[500px] mx-auto mb-10 leading-relaxed">
                EtHOS thrives on collaboration. Whether you are a student with a hardware idea,
                a company looking to connect with embedded talent, or an alumnus who wants to
                give back — there is a place for you here.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {tiles.map(({ href, label, sub, c }) => (
                  <Link key={href} href={href} className={`flex flex-col items-center gap-1.5 px-4 py-5 rounded-xl border bg-card/60 backdrop-blur-sm text-sm font-semibold transition-all duration-200 ${c} hover:scale-[1.03] hover:-translate-y-0.5`}>
                    {label}
                    <span className="text-[11px] font-normal text-muted-foreground text-center">{sub}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSection() {
  const s = useSiteSettings()
  const contactDetails = [
    { icon: Mail,   label: 'Email',     value: s.contactEmail,    href: `mailto:${s.contactEmail}` },
    { icon: MapPin, label: 'Location',  value: s.contactAddress,  href: null },
    { icon: Clock,  label: 'Lab hours', value: s.contactHours,    href: null },
    { icon: Github, label: 'GitHub',    value: s.github.replace('https://', ''), href: s.github },
  ]
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1.5">// contact_us</p>
            <h2 className="text-3xl font-display font-bold mb-3">Get in touch</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm">
              Have a question, a project proposal, or want to visit the lab?
              We are here every day of the week.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-7">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/18 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold hover:text-primary transition-colors truncate block">{value}</a>
                    ) : (
                      <p className="text-sm font-semibold truncate">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Github,   href: s.github,   label: 'GitHub' },
                { icon: Twitter,  href: s.twitter,  label: 'Twitter' },
                { icon: Linkedin, href: s.linkedin, label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted transition-all duration-200 hover:scale-110">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <Link href="/contact" className="ml-auto inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2.5 transition-all duration-200 font-semibold">
                Full contact page <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="bg-card border border-border rounded-xl p-7 hover:border-primary/20 transition-colors duration-300">
              <p className="font-display font-bold text-xl mb-1">Send a quick message</p>
              <p className="text-sm text-muted-foreground mb-6">We typically respond within 24 hours.</p>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[{label:'Your name',placeholder:'Arjun Mehta',type:'text'},{label:'Email address',placeholder:'you@iet.edu',type:'email'}].map(({ label, placeholder, type }) => (
                    <div key={label}>
                      <label className="block text-xs text-muted-foreground mb-1.5 font-mono">{label}</label>
                      <input type={type} placeholder={placeholder}
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/45 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-mono">Message</label>
                  <textarea rows={4} placeholder="What are you working on?"
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none placeholder:text-muted-foreground/45 transition-all" />
                </div>
                <Link href="/contact" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20">
                  Send message <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <AnnouncementsSection />
      <ProjectsSection />
      <EventsSection />
      <AchievementsSection />
      <CollaborateSection />
      <ContactSection />
    </>
  )
}

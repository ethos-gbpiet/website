'use client'

import { Target, Lightbulb, Users, Award, BookOpen, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { stats as seed } from '@/data'
import { useSiteSettings } from '@/lib/use-site-settings'
import { useApiData } from '@/lib/use-api-data'

const values = [
  { icon: Lightbulb, title: 'Innovation First',       desc: 'We push the boundaries of what is possible, encouraging bold ideas and experimental thinking in every project.' },
  { icon: Users,     title: 'Collaborative Spirit',   desc: 'Great engineering is a team sport. We foster mentorship, peer learning, and cross-domain collaboration.' },
  { icon: Target,    title: 'Real-World Impact',      desc: 'Every project we build solves a real problem — from smart irrigation to autonomous navigation systems.' },
  { icon: BookOpen,  title: 'Continuous Learning',    desc: 'Regular workshops, guest lectures, and paper readings keep our members at the cutting edge of technology.' },
  { icon: Wrench,    title: 'Hands-On Approach',      desc: 'Theory meets practice in our lab. We believe in building, breaking, and iterating as the core learning loop.' },
  { icon: Award,     title: 'Excellence & Accountability', desc: 'We hold ourselves to high standards, delivering quality work and learning from every failure.' },
]

const milestones = [
  { year: '2014', title: 'Society Founded',        desc: 'EtHOS established with 8 founding members and access to the college electronics lab.' },
  { year: '2016', title: 'First National Award',   desc: 'Won the NCSMC Embedded Systems Championship with a custom 8-bit CPU design.' },
  { year: '2018', title: 'PCB Lab Launched',        desc: 'Expanded into PCB design and power electronics with a dedicated lab and component library.' },
  { year: '2020', title: 'Virtual Hardware Fest',   desc: 'Hosted a fully online hardware hackathon with 800+ participants across 30 colleges.' },
  { year: '2022', title: 'Industry Partnerships',   desc: 'Signed MoUs with 3 tech companies for student internships and sponsored component funding.' },
  { year: '2024', title: '120+ Members',            desc: 'Largest cohort ever with projects spanning FPGA, RF, power electronics, and embedded systems.' },
]

export default function AboutPage() {
  const s = useSiteSettings()
  const stats = useApiData('/api/stats', seed)

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 bg-grid overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// about_{s.siteName.toLowerCase()}</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 max-w-2xl">
            {s.aboutTitle.includes(' ') ? (
              <>
                {s.aboutTitle.split(' ').slice(0, Math.ceil(s.aboutTitle.split(' ').length / 2)).join(' ')}{' '}
                <span className="gradient-text">
                  {s.aboutTitle.split(' ').slice(Math.ceil(s.aboutTitle.split(' ').length / 2)).join(' ')}
                </span>
              </>
            ) : (
              <span className="gradient-text">{s.aboutTitle}</span>
            )}
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed text-lg">
            {s.aboutBody}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-display font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-primary/20 bg-primary/5">
              <p className="text-xs font-mono text-primary mb-3">01 / mission</p>
              <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To cultivate a vibrant, interdisciplinary hardware engineering community where students gain
                practical PCB design and embedded systems skills, develop real-world solutions, and grow
                into confident technical leaders — ready to contribute to industry and research.
              </p>
            </Card>
            <Card className="p-8 border-accent/20 bg-accent/5">
              <p className="text-xs font-mono text-accent mb-3">02 / vision</p>
              <h2 className="text-2xl font-display font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the most impactful student-led hardware society in India — known for producing
                technically excellent engineers who design circuits, build systems, and solve real
                problems through hands-on engineering.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-primary mb-2">// core_values</p>
            <h2 className="text-3xl font-display font-bold">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="card-hover p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-primary mb-2">// our_journey</p>
            <h2 className="text-3xl font-display font-bold">Milestones & History</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`md:w-1/2 pl-20 md:pl-0 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <Card className="p-5 card-hover">
                      <p className="text-xs font-mono text-primary mb-1">{m.year}</p>
                      <h3 className="font-display font-semibold mb-1">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </Card>
                  </div>
                  <div className="absolute left-6 md:left-1/2 top-5 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Send, CheckCircle, Users, Rocket, Code2, Cpu } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/lib/use-site-settings'

export default function CollaboratePage() {
  const s = useSiteSettings()
  const collaborationTypes = [
    { id: 'project', icon: Rocket, label: 'Join a Project',      desc: `Contribute to an ongoing ${s.siteName} project` },
    { id: 'propose', icon: Code2,  label: 'Propose a Project',   desc: `Bring your own project idea to ${s.siteName}` },
    { id: 'sponsor', icon: Cpu,    label: 'Corporate / Sponsor', desc: 'Partner with us or sponsor an event/lab' },
    { id: 'mentor',  icon: Users,  label: 'Become a Mentor',     desc: 'Guide students as an alumni or industry mentor' },
  ]
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    type: '',
    name: '',
    email: '',
    organisation: '',
    year: '',
    branch: '',
    domain: '',
    projectIdea: '',
    experience: '',
    message: '',
    links: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Collaboration request:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Request Received!</h2>
          <p className="text-muted-foreground mb-6">
            Thanks for reaching out! Our team will review your collaboration request and get back to you within 3–5 working days.
          </p>
          <Button onClick={() => { setSubmitted(false); setForm({ ...form, type: '' }) }} variant="outline">
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// collaborate</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Collaborate <span className="gradient-text">With Us</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Whether you're a student with a project idea, a company looking to partner, or an alumnus who wants to give back — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Collaboration type */}
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-4">How do you want to collaborate?</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {collaborationTypes.map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm({ ...form, type: id })}
                    className={`flex gap-3 p-4 rounded-xl border text-left transition-all ${
                      form.type === id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${form.type === id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Personal info */}
            <Card className="p-6 space-y-4">
              <h2 className="font-display font-semibold">Your Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: 'name', label: 'Full Name *', placeholder: 'Priya Sharma', required: true },
                  { id: 'email', label: 'Email Address *', placeholder: 'you@iet.edu', required: true, type: 'email' },
                  { id: 'organisation', label: 'College / Organisation', placeholder: 'IET College' },
                  { id: 'year', label: 'Year & Branch', placeholder: '2nd Year, ECE' },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="block text-sm text-muted-foreground mb-1.5">{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={form[f.id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Domain & experience */}
            <Card className="p-6 space-y-4">
              <h2 className="font-display font-semibold">Skills &amp; Experience</h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Technical Domain / Skills</label>
                <input
                  type="text"
                  placeholder="e.g. ROS2, Python, PCB Design, React, ML…"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Prior Experience / Projects</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe relevant experience or projects you've worked on…"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Portfolio / GitHub / LinkedIn</label>
                <input
                  type="text"
                  placeholder="https://github.com/yourprofile"
                  value={form.links}
                  onChange={(e) => setForm({ ...form, links: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </Card>

            {/* Project idea (conditional) */}
            {form.type === 'propose' && (
              <Card className="p-6">
                <h2 className="font-display font-semibold mb-4">Your Project Idea</h2>
                <textarea
                  rows={5}
                  placeholder="Describe your project idea — problem statement, proposed solution, expected outcomes…"
                  value={form.projectIdea}
                  onChange={(e) => setForm({ ...form, projectIdea: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </Card>
            )}

            {/* Message */}
            <Card className="p-6">
              <h2 className="font-display font-semibold mb-4">Anything else to share?</h2>
              <textarea
                rows={3}
                placeholder="Availability, specific project interests, or questions for the team…"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </Card>

            <Button type="submit" size="lg" variant="glow" className="w-full gap-2" disabled={!form.type}>
              <Send className="w-4 h-4" /> Submit Collaboration Request
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

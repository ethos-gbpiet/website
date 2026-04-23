'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Clock, Send, CheckCircle, Github, Twitter, Linkedin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/lib/use-site-settings'

export default function ContactPage() {
  const s = useSiteSettings()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', category: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Contact form:', form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Message Sent!</h2>
          <p className="text-muted-foreground mb-6">
            We will get back to you within 24–48 hours at {s.contactEmail}.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">Send Another</Button>
        </div>
      </div>
    )
  }

  const contactDetails = [
    { icon: Mail,   label: 'Email',    value: s.contactEmail,   href: `mailto:${s.contactEmail}` },
    { icon: Phone,  label: 'Phone',    value: s.contactPhone,   href: `tel:${s.contactPhone.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Address',  value: s.contactAddress, href: null },
    { icon: Clock,  label: 'Lab Hours',value: s.contactHours,   href: null },
  ]

  return (
    <div className="pt-20">
      <section className="py-16 bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <p className="text-xs font-mono text-primary mb-3">// contact_us</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Have a question, proposal, or want to visit the lab? We are always open to conversations.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl mb-5">Contact Information</h2>
                <div className="space-y-4">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm hover:text-primary transition-colors">{value}</a>
                        ) : (
                          <p className="text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4">Follow {s.siteName}</h3>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { icon: Github,   href: s.github,   label: 'GitHub' },
                    { icon: Twitter,  href: s.twitter,  label: 'Twitter' },
                    { icon: Linkedin, href: s.linkedin, label: 'LinkedIn' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Icon className="w-4 h-4" />{label}
                    </a>
                  ))}
                </div>
              </Card>

              {/* Map placeholder */}
              <Card className="overflow-hidden h-48 relative bg-muted border border-border">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-mono text-muted-foreground">{s.collegeFullName}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-display font-bold text-xl mb-5">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Name *</label>
                    <input type="text" required placeholder="Your name" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Email *</label>
                    <input type="email" required placeholder={s.contactEmail} value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select a category…</option>
                    <option>General Inquiry</option>
                    <option>Project Collaboration</option>
                    <option>Event Sponsorship</option>
                    <option>Membership</option>
                    <option>Media & Press</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Subject *</label>
                  <input type="text" required placeholder="What is this about?" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Message *</label>
                  <textarea rows={6} required placeholder="Your message here…" value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <Button type="submit" size="lg" variant="glow" className="w-full gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

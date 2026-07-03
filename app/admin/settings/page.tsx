'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Save, RotateCcw, Globe, Mail, Users, Palette,
  ChevronDown, ChevronUp, Lock, ExternalLink, CheckCircle, AlertCircle, Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SiteSettings, defaultSettings, useSiteContext } from '@/lib/site-context'

type Section = 'branding' | 'hero' | 'about' | 'contact' | 'social' | 'security'

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted-foreground mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>}
    </div>
  )
}

function Accordion({ title, icon: Icon, id, open, toggle, children }: {
  title: string; icon: React.ElementType; id: Section
  open: boolean; toggle: (id: Section) => void; children: React.ReactNode
}) {
  return (
    <Card className={`overflow-hidden transition-colors ${open ? 'border-primary/30' : ''}`}>
      <button onClick={() => toggle(id)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-muted/30 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="font-display font-semibold">{title}</span>
        <div className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && <div className="px-6 pb-6 grid gap-4 border-t border-border pt-5">{children}</div>}
    </Card>
  )
}

export default function SiteSettingsPage() {
  const { settings: liveSettings, saveSettings, loading } = useSiteContext()

  const [form, setForm]         = useState<SiteSettings>(defaultSettings)
  const [openSection, setOpen]  = useState<Section>('branding')
  const [heroLines, setHeroLines] = useState(defaultSettings.heroHeading.join('\n'))
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passError, setPassError] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync form when live settings load from API
  useEffect(() => {
    setForm(liveSettings)
    setHeroLines(liveSettings.heroHeading.join('\n'))
    setAdminUsername((liveSettings as any).adminUsername || 'ethos_admin')
  }, [liveSettings])

  function toggle(id: Section) {
    setOpen(prev => prev === id ? 'branding' : id)
  }

  function set(key: keyof SiteSettings, value: string | string[]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (adminPassword) {
      if (adminPassword.length < 8) { setPassError('Password must be at least 8 characters.'); return }
      if (adminPassword !== confirmPassword) { setPassError('Passwords do not match.'); return }
    }
    setPassError('')
    setStatus('saving')
    setErrorMsg('')

    const toSave: any = {
      ...form,
      heroHeading: heroLines.split('\n').map(l => l.trim()).filter(Boolean),
    }
    if (adminUsername.trim()) toSave.adminUsername = adminUsername.trim()
    if (adminPassword)        toSave.adminPassword = adminPassword

    const ok = await saveSettings(toSave)
    if (ok) {
      setAdminPassword('')
      setConfirmPassword('')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 4000)
    } else {
      setStatus('error')
      setErrorMsg('Could not write to server. Make sure npm run dev is running.')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  async function handleReset() {
    if (!confirm('Reset all site settings to defaults? This cannot be undone.')) return
    setStatus('saving')
    const ok = await saveSettings(defaultSettings)
    if (ok) {
      setForm(defaultSettings)
      setHeroLines(defaultSettings.heroHeading.join('\n'))
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 4000)
    } else {
      setStatus('error')
      setErrorMsg('Reset failed.')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading settings from server…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes are written to disk permanently — every page and every browser shows the
            updated content immediately after saving.{' '}
            <Link href="/" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
              View live site <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleReset} variant="outline" size="sm" className="gap-2" disabled={status === 'saving'}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button onClick={handleSave} variant="glow" size="sm" className="gap-2 px-5 min-w-[140px]"
            disabled={status === 'saving'}>
            {status === 'saving'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save &amp; Publish</>
            }
          </Button>
        </div>
      </div>

      {/* Status banners */}
      {status === 'saved' && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Changes saved and published successfully</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              Settings written to <code className="font-mono">data/settings.json</code> — all pages are now showing the updated content.
            </p>
          </div>
          <button onClick={() => setStatus('idle')} className="ml-auto text-emerald-400/50 hover:text-emerald-400 text-xl leading-none">×</button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Save failed</p>
            <p className="text-xs text-destructive/70 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* How it works banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 text-sm text-muted-foreground">
        <strong className="text-primary font-mono">How saving works:</strong> Clicking{' '}
        <strong>Save &amp; Publish</strong> sends settings to the Next.js API route, which writes
        them to <code className="font-mono text-primary">data/settings.json</code> on disk.
        Every page fetches from this file on every load — so changes are instant, permanent,
        and visible in all browsers without any page refresh.
      </div>

      {/* ── Branding ── */}
      <Accordion title="Branding & Identity" icon={Palette} id="branding" open={openSection === 'branding'} toggle={toggle}>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Site Name" hint="Navbar, footer, browser tab">
            <input className={inp} value={form.siteName}
              onChange={e => set('siteName', e.target.value)} placeholder="EtHOS" />
          </FormField>
          <FormField label="Full Tagline" hint="Shown under site name in footer">
            <input className={inp} value={form.siteTagline}
              onChange={e => set('siteTagline', e.target.value)} />
          </FormField>
          <FormField label="College / Organisation">
            <input className={inp} value={form.collegeFullName}
              onChange={e => set('collegeFullName', e.target.value)} />
          </FormField>
          <FormField label="Founded Year">
            <input className={inp} value={form.foundedYear}
              onChange={e => set('foundedYear', e.target.value)} placeholder="2014" />
          </FormField>
        </div>
      </Accordion>

      {/* ── Hero ── */}
      <Accordion title="Hero Section (Homepage)" icon={Globe} id="hero" open={openSection === 'hero'} toggle={toggle}>
        <FormField label="Heading Lines" hint="One line per row — 2nd line gets the cyan gradient colour">
          <textarea className={`${inp} resize-none font-mono`} rows={3} value={heroLines}
            onChange={e => setHeroLines(e.target.value)}
            placeholder={"Design.\nBuild.\nPower."} />
        </FormField>
        <FormField label="Hero Subtext / Description">
          <textarea className={`${inp} resize-none`} rows={4} value={form.heroSubtext}
            onChange={e => set('heroSubtext', e.target.value)} />
        </FormField>
      </Accordion>

      {/* ── About ── */}
      <Accordion title="About Section" icon={Users} id="about" open={openSection === 'about'} toggle={toggle}>
        <FormField label="Section Title">
          <input className={inp} value={form.aboutTitle}
            onChange={e => set('aboutTitle', e.target.value)} />
        </FormField>
        <FormField label="Body Text">
          <textarea className={`${inp} resize-none`} rows={5} value={form.aboutBody}
            onChange={e => set('aboutBody', e.target.value)} />
        </FormField>
      </Accordion>

      {/* ── Contact ── */}
      <Accordion title="Contact Information" icon={Mail} id="contact" open={openSection === 'contact'} toggle={toggle}>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Email Address">
            <input className={inp} type="email" value={form.contactEmail}
              onChange={e => set('contactEmail', e.target.value)} />
          </FormField>
          <FormField label="Phone Number">
            <input className={inp} value={form.contactPhone}
              onChange={e => set('contactPhone', e.target.value)} />
          </FormField>
          <FormField label="Physical Address">
            <input className={inp} value={form.contactAddress}
              onChange={e => set('contactAddress', e.target.value)} />
          </FormField>
          <FormField label="Lab / Office Hours">
            <input className={inp} value={form.contactHours}
              onChange={e => set('contactHours', e.target.value)} />
          </FormField>
        </div>
      </Accordion>

      {/* ── Social ── */}
      <Accordion title="Social Media Links" icon={Globe} id="social" open={openSection === 'social'} toggle={toggle}>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="GitHub URL">
            <input className={inp} value={form.github}
              onChange={e => set('github', e.target.value)} />
          </FormField>
          <FormField label="Twitter / X URL">
            <input className={inp} value={form.twitter}
              onChange={e => set('twitter', e.target.value)} />
          </FormField>
          <FormField label="LinkedIn URL">
            <input className={inp} value={form.linkedin}
              onChange={e => set('linkedin', e.target.value)} />
          </FormField>
        </div>
      </Accordion>

      {/* ── Security ── */}
      <Accordion title="Admin Credentials" icon={Lock} id="security" open={openSection === 'security'} toggle={toggle}>
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 text-sm text-amber-400 mb-2">
          ⚠ Keep these safe. Credentials are stored in <code className="font-mono">data/settings.json</code>.
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Admin Username">
            <input className={inp} value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)} autoComplete="off" />
          </FormField>
          <div />
          <FormField label="New Password" hint="Leave blank to keep current">
            <input className={inp} type="password" value={adminPassword}
              onChange={e => { setAdminPassword(e.target.value); setPassError('') }}
              autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm New Password">
            <input className={inp} type="password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPassError('') }}
              autoComplete="new-password" />
          </FormField>
        </div>
        {passError && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">{passError}</p>
        )}
      </Accordion>

      {/* Bottom save */}
      <div className="flex justify-end gap-3 pt-2 pb-8">
        <Button onClick={handleReset} variant="outline" className="gap-2" disabled={status === 'saving'}>
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </Button>
        <Button onClick={handleSave} variant="glow" className="gap-2 px-8 min-w-[180px]" disabled={status === 'saving'}>
          {status === 'saving'
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save &amp; Publish All Changes</>
          }
        </Button>
      </div>
    </div>
  )
}

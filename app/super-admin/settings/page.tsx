'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'

const FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: 'siteName',         label: 'Site / Society Name',      placeholder: 'EtHOS' },
  { key: 'siteTagline',      label: 'Tagline',                   placeholder: 'Electronics and Hardware Oriented Society' },
  { key: 'collegeFullName',  label: 'College Full Name',         placeholder: 'IET College, Dehradun' },
  { key: 'foundedYear',      label: 'Founded Year',              placeholder: '2014' },
  { key: 'contactEmail',     label: 'Contact Email',             placeholder: 'ethos@iet.edu', type: 'email' },
  { key: 'contactPhone',     label: 'Contact Phone',             placeholder: '+91 98765 43210' },
  { key: 'contactAddress',   label: 'Address',                   placeholder: 'PCB Lab, Block D…' },
  { key: 'contactHours',     label: 'Office Hours',              placeholder: 'Mon–Sat, 10 AM – 8 PM' },
  { key: 'github',           label: 'GitHub URL',                placeholder: 'https://github.com/…' },
  { key: 'twitter',          label: 'Twitter / X URL',           placeholder: 'https://twitter.com/…' },
  { key: 'linkedin',         label: 'LinkedIn URL',              placeholder: 'https://linkedin.com/…' },
]

export default function SiteSettingsPage() {
  const [data, setData]         = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  function toast(msg: string, ok = true) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function save() {
    setSaving(true)
    const r = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (r.ok) toast('Settings saved successfully')
    else toast('Failed to save settings', false)
  }

  return (
    <div className="p-6 space-y-6">
      {feedback && (
        <div className={cn('fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm shadow-xl',
          feedback.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive')}>
          {feedback.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-muted-foreground">// content.site_settings</span>
          </div>
          <h1 className="text-2xl font-display font-bold">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Changes here reflect on the public website immediately after saving.
          </p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-60 transition-all glow-cyan">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">{label}</label>
                <input
                  type={type ?? 'text'}
                  placeholder={placeholder}
                  value={data[key] ?? ''}
                  onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
                  className={inp}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

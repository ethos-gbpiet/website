'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings as SettingsIcon, Bell, Shield, Trash2, Save } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/form-elements'
import { useToast } from '@/components/ui/toaster'
import { getCurrentUser, signOut, setSession } from '@/lib/auth'

export default function MemberSettingsPage() {
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [eventNotifs, setEventNotifs] = useState(true)
  const [projectNotifs, setProjectNotifs] = useState(true)

  useEffect(() => {
    const u = getCurrentUser()
    if (u) {
      setName(u.name)
      setEmail(u.email ?? '')
    }
    try {
      const prefs = JSON.parse(localStorage.getItem('ethos_member_prefs') ?? '{}')
      if (typeof prefs.emailNotifs === 'boolean') setEmailNotifs(prefs.emailNotifs)
      if (typeof prefs.eventNotifs === 'boolean') setEventNotifs(prefs.eventNotifs)
      if (typeof prefs.projectNotifs === 'boolean') setProjectNotifs(prefs.projectNotifs)
    } catch {}
  }, [])

  function handleSave() {
    const u = getCurrentUser()
    if (u) setSession({ ...u, name, email })
    localStorage.setItem('ethos_member_prefs', JSON.stringify({
      emailNotifs, eventNotifs, projectNotifs,
    }))
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' })
  }

  function handleDelete() {
    if (!confirm('Delete your local account data? This cannot be undone.')) return
    ;[
      'ethos_member_notifications',
      'ethos_member_events',
      'ethos_member_projects',
      'ethos_member_feedback',
      'ethos_member_prefs',
    ].forEach(k => localStorage.removeItem(k))
    signOut()
    router.replace('/')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] font-mono text-primary uppercase tracking-[0.2em] mb-2">// account</p>
        <h1 className="text-3xl font-display font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, notification preferences, and account.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display font-semibold">Profile</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" hint="Used for important account updates.">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          <PrefRow label="Email notifications"
            description="Get a digest in your inbox once a week."
            value={emailNotifs} onChange={setEmailNotifs} />
          <PrefRow label="Event reminders"
            description="Reminders 24 hours before events you've registered for."
            value={eventNotifs} onChange={setEventNotifs} />
          <PrefRow label="Project updates"
            description="Notify me when projects I follow ship updates."
            value={projectNotifs} onChange={setProjectNotifs} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} variant="glow">
          <Save className="w-4 h-4 mr-1.5" /> Save changes
        </Button>
      </div>

      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-destructive" />
          </div>
          <h2 className="font-display font-semibold">Danger zone</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Deleting your local account clears your registrations, joined projects, feedback history, and notifications stored on this device.
        </p>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1.5" /> Delete local account data
        </Button>
      </Card>
    </div>
  )
}

function PrefRow({ label, description, value, onChange }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-left">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${value ? 'bg-primary' : 'bg-muted'}`}>
        <div className={`w-5 h-5 rounded-full bg-background transition-transform ${value ? 'translate-x-4' : ''}`} />
      </div>
    </button>
  )
}

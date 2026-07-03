'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  User, Camera, FileText, Github, Linkedin, Instagram,
  Globe, Twitter, Save, Upload, Trash2, CheckCircle2, AlertCircle,
  Eye, EyeOff, Lock
} from 'lucide-react'

interface MemberProfile {
  id: string
  name: string
  email: string
  role: string
  year: string
  domain: string
  bio: string
  photo?: string
  resume?: string
  github?: string
  linkedin?: string
  instagram?: string
  twitter?: string
  website?: string
}

export default function AccountPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'ids' | 'resume' | 'security'>('profile')
  const [showPass, setShowPass] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  const memberId = (session?.user as any)?.id

  useEffect(() => {
    if (!memberId) return
    fetch(`/api/members?action=profile&id=${memberId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setProfile(data) })
      .finally(() => setLoading(false))
  }, [memberId])

  const update = (field: string, value: string) =>
    setProfile(p => p ? { ...p, [field]: value } : p)

  async function handleSave() {
    if (!profile) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/members?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange() {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords do not match'); return
    }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/members?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, newPassword }),
      })
      if (!res.ok) throw new Error('Failed to change password')
      setSaved(true); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Photo must be under 2 MB'); return }
    const b64 = await toBase64(file)
    update('photo', b64)
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Resume must be under 5 MB'); return }
    const b64 = await toBase64(file)
    update('resume', b64)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-muted-foreground">Unable to load your profile. Please sign in again.</p>
      </div>
    </div>
  )

  const tabs = [
    { id: 'profile',  label: 'Profile',     Icon: User },
    { id: 'ids',      label: 'Social IDs',  Icon: Linkedin },
    { id: 'resume',   label: 'Resume',      Icon: FileText },
    { id: 'security', label: 'Security',    Icon: Lock },
  ] as const

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">// my_account</p>
        <h1 className="text-3xl font-display font-bold">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your info syncs automatically with the public team page once saved.
        </p>
      </div>

      {/* Login ID badge */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-border bg-muted/30">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm">
          {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="text-[11px] font-mono text-muted-foreground">Login ID: <span className="text-primary">{profile.email}</span> · Role: <span className="text-primary">{profile.role}</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 border border-border">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono transition-all ${
              activeTab === id
                ? 'bg-card border border-border text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />Changes saved and synced to team page!
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          {/* Avatar upload */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-4">Profile Photo</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                    {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center hover:bg-primary/85 transition-colors">
                  <Camera className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">Upload photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP — max 2 MB</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => photoRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                    <Upload className="w-3 h-3" /> Choose file
                  </button>
                  {profile.photo && (
                    <button onClick={() => update('photo', '')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">Basic Info</h3>
            {[
              { label: 'Full Name',  field: 'name',   type: 'text' },
              { label: 'Email',      field: 'email',  type: 'email' },
              { label: 'Year',       field: 'year',   type: 'text', placeholder: 'e.g. 3rd Year, CS' },
              { label: 'Domain',     field: 'domain', type: 'text', placeholder: 'e.g. Web Development' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type={type}
                  value={(profile as any)[field] || ''}
                  onChange={e => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => update('bio', e.target.value)}
                rows={4}
                placeholder="Tell the world a bit about yourself..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL IDS TAB */}
      {activeTab === 'ids' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Social IDs & Links</h3>
          <p className="text-xs text-muted-foreground">These appear on your public team profile page.</p>
          {[
            { label: 'GitHub',    field: 'github',    Icon: Github,    placeholder: 'https://github.com/yourusername' },
            { label: 'LinkedIn',  field: 'linkedin',  Icon: Linkedin,  placeholder: 'https://linkedin.com/in/yourusername' },
            { label: 'Instagram', field: 'instagram', Icon: Instagram, placeholder: 'https://instagram.com/yourusername' },
            { label: 'Twitter/X', field: 'twitter',   Icon: Twitter,   placeholder: 'https://twitter.com/yourusername' },
            { label: 'Website',   field: 'website',   Icon: Globe,     placeholder: 'https://yourwebsite.com' },
          ].map(({ label, field, Icon, placeholder }) => (
            <div key={field}>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" />{label}
              </label>
              <input
                type="url"
                value={(profile as any)[field] || ''}
                onChange={e => update(field, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
              />
            </div>
          ))}
        </div>
      )}

      {/* RESUME TAB */}
      {activeTab === 'resume' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Resume / CV</h3>
          <p className="text-xs text-muted-foreground">Upload a PDF resume. It will appear on your public profile for download and inline viewing. Max 5 MB.</p>
          {profile.resume ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-red-400">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Resume uploaded</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Base64 PDF stored</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => resumeRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                    <Upload className="w-3 h-3" /> Replace
                  </button>
                  <button onClick={() => update('resume', '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
              <iframe src={profile.resume} title="Resume preview" className="w-full" style={{ height: '50vh', border: 'none' }} />
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">No resume uploaded yet</p>
              <p className="text-xs text-muted-foreground mb-4">PDF only · max 5 MB</p>
              <button onClick={() => resumeRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors">
                <Upload className="w-4 h-4" /> Upload Resume
              </button>
            </div>
          )}
          <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Change Password</h3>
          <p className="text-xs text-muted-foreground">Choose a strong password of at least 8 characters.</p>
          {[
            { label: 'New Password',     state: newPassword,      setter: setNewPassword },
            { label: 'Confirm Password', state: confirmPassword,  setter: setConfirmPassword },
          ].map(({ label, state, setter }) => (
            <div key={label}>
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={state}
                  onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={handlePasswordChange} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors">
            <Lock className="w-4 h-4" /> {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      )}

      {/* Save bar — shown on profile and ids tabs */}
      {(activeTab === 'profile' || activeTab === 'ids' || activeTab === 'resume') && (
        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & Sync'}
          </button>
        </div>
      )}
    </div>
  )
}

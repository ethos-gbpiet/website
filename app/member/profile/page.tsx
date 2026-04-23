'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Upload, X, Loader2, CheckCircle, Eye, EyeOff, FileText } from 'lucide-react'

interface MemberSession {
  id: string; name: string; username: string; role: string
  domain: string; year: string; email: string
  bio?: string; github?: string; linkedin?: string; photo?: string; resume?: string
}

function getSession(): MemberSession | null {
  try { const r = sessionStorage.getItem('ethos_member'); return r ? JSON.parse(r) : null } catch { return null }
}
function setSession(m: MemberSession) {
  try { sessionStorage.setItem('ethos_member', JSON.stringify(m)) } catch {}
}

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'

export default function MemberProfilePage() {
  const [member, setMember] = useState<MemberSession | null>(null)
  const [form, setForm] = useState<Partial<MemberSession>>({})
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwError, setPwError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const s = getSession()
    if (!s) return
    // Fetch fresh profile from API
    fetch('/api/members?action=list', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then((list: MemberSession[]) => {
        const fresh = list.find(m => m.id === s.id) || s
        setMember(fresh); setForm(fresh)
      })
      .catch(() => { setMember(s); setForm(s) })
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  function handleResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('PDF must be under 5 MB'); return }
    if (file.type !== 'application/pdf') { alert('Only PDF files accepted'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, resume: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!member) return
    setStatus('saving')
    try {
      const res = await fetch('/api/members?action=update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: member.id }),
      })
      const data = await res.json()
      if (data.ok) {
        setMember(data.member); setForm(data.member)
        setSession(data.member)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } else { setStatus('error'); setTimeout(() => setStatus('idle'), 3000) }
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000) }
  }

  async function handlePasswordChange() {
    if (!pw.current || !pw.new) { setPwError('All fields required'); return }
    if (pw.new.length < 8) { setPwError('Password must be at least 8 characters'); return }
    if (pw.new !== pw.confirm) { setPwError('Passwords do not match'); return }
    setPwError(''); setPwStatus('saving')
    try {
      const res = await fetch('/api/members?action=reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member!.id, newPassword: pw.new }),
      })
      const data = await res.json()
      if (data.ok) {
        setPw({ current: '', new: '', confirm: '' })
        setPwStatus('saved'); setTimeout(() => setPwStatus('idle'), 3000)
      } else { setPwStatus('error'); setTimeout(() => setPwStatus('idle'), 3000) }
    } catch { setPwStatus('error'); setTimeout(() => setPwStatus('idle'), 3000) }
  }

  if (!member) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes you save here update your public team page entry.
          </p>
        </div>
        <button onClick={handleSave} disabled={status === 'saving'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 transition-all glow-cyan shadow-md shadow-primary/20">
          {status === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : status === 'saved' ? <><CheckCircle className="w-4 h-4" /> Saved!</>
          : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {status === 'saved' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-400/10 border border-emerald-400/25 text-sm text-emerald-400">
          <CheckCircle className="w-4 h-4 shrink-0" /> Profile saved — your team page will now show the updated info.
        </div>
      )}

      {/* Photo */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display font-semibold mb-4">Photo &amp; Resume</h2>
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar preview */}
          <div className="relative">
            {form.photo ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30">
                <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-display font-bold text-primary">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => photoRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload Photo (max 2 MB)
              </button>
              {form.photo && (
                <button onClick={() => setForm(f => ({ ...f, photo: undefined }))}
                  className="px-3 py-1.5 rounded-md border border-border text-xs text-destructive hover:bg-destructive/10 transition-colors">
                  Remove
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => resumeRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted transition-colors">
                <FileText className="w-3.5 h-3.5" /> {form.resume ? 'Replace Resume PDF' : 'Upload Resume PDF'} (max 5 MB)
              </button>
              {form.resume && (
                <>
                  <span className="text-xs text-emerald-400 font-mono self-center">✓ PDF uploaded</span>
                  <button onClick={() => setForm(f => ({ ...f, resume: undefined }))}
                    className="px-3 py-1.5 rounded-md border border-border text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    Remove
                  </button>
                </>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" onChange={handleResume} />
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Full Name</label>
            <input className={inp} value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Role / Position</label>
            <input className={inp} value={form.role || ''} onChange={e => set('role', e.target.value)} /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Year &amp; Branch</label>
            <input className={inp} value={form.year || ''} onChange={e => set('year', e.target.value)} placeholder="3rd Year, ECE" /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Domain</label>
            <input className={inp} value={form.domain || ''} onChange={e => set('domain', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="block text-xs font-mono text-muted-foreground mb-1">Email</label>
            <input className={inp} type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
        </div>
        <div><label className="block text-xs font-mono text-muted-foreground mb-1">Bio</label>
          <textarea className={`${inp} resize-none`} rows={3} value={form.bio || ''}
            onChange={e => set('bio', e.target.value)} placeholder="What you work on at EtHOS…" /></div>
      </div>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Social &amp; Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">GitHub URL</label>
            <input className={inp} value={form.github || ''} onChange={e => set('github', e.target.value)} placeholder="https://github.com/…" /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">LinkedIn URL</label>
            <input className={inp} value={form.linkedin || ''} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold">Change Password</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Current Password</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={pw.current}
              onChange={e => { setPw(p => ({ ...p, current: e.target.value })); setPwError('') }} /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">New Password</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={pw.new}
              onChange={e => { setPw(p => ({ ...p, new: e.target.value })); setPwError('') }} /></div>
          <div><label className="block text-xs font-mono text-muted-foreground mb-1">Confirm New</label>
            <input className={inp} type={showPw ? 'text' : 'password'} value={pw.confirm}
              onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError('') }} /></div>
        </div>
        {pwError && <p className="text-xs text-destructive">{pwError}</p>}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPw(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPw ? 'Hide' : 'Show'} passwords
          </button>
          <button onClick={handlePasswordChange} disabled={pwStatus === 'saving'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-sm hover:bg-muted/80 transition-colors disabled:opacity-60">
            {pwStatus === 'saving' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…</>
            : pwStatus === 'saved' ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Password Updated</>
            : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

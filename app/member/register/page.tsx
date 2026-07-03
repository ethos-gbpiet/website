'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cpu, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const domains = ['PCB Design', 'Embedded Systems', 'Power Electronics', 'FPGA & Digital', 'RF & Wireless', 'Signal Processing', 'Management', 'Events', 'Other']
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const branches = ['ECE', 'EEE', 'CS', 'IT', 'ME', 'CE', 'Other']

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40'

export default function MemberRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
    role: 'Member', year: '2nd Year', branch: 'ECE', domain: 'PCB Design',
    bio: '', github: '', linkedin: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/members?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: `${form.year}, ${form.branch}`,
        }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Could not reach server.')
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Registration Submitted!</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Your account request has been sent to the admin for review.
          You will be able to log in once approved — usually within 24 hours.
        </p>
        <Link href="/member/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background bg-grid py-12 px-4 relative">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="max-w-xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Request Member Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Fill in your details — admin will approve within 24 hours</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Full Name *</label>
                <input className={inp} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Arjun Mehta" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Username *</label>
                <input className={inp} required value={form.username} onChange={e => set('username', e.target.value)} placeholder="arjun_mehta" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">College Email *</label>
                <input className={inp} type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@iet.edu" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Role / Position</label>
                <input className={inp} value={form.role} onChange={e => set('role', e.target.value)} placeholder="PCB Design Lead" /></div>
            </div>

            {/* Academic */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Year</label>
                <select className={inp} value={form.year} onChange={e => set('year', e.target.value)}>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Branch</label>
                <select className={inp} value={form.branch} onChange={e => set('branch', e.target.value)}>
                  {branches.map(b => <option key={b}>{b}</option>)}
                </select></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Domain</label>
                <select className={inp} value={form.domain} onChange={e => set('domain', e.target.value)}>
                  {domains.map(d => <option key={d}>{d}</option>)}
                </select></div>
            </div>

            {/* Bio */}
            <div><label className="block text-xs font-mono text-muted-foreground mb-1">Short Bio</label>
              <textarea className={`${inp} resize-none`} rows={2} value={form.bio}
                onChange={e => set('bio', e.target.value)} placeholder="What you work on at EtHOS…" /></div>

            {/* Social */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">GitHub URL</label>
                <input className={inp} value={form.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/…" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">LinkedIn URL</label>
                <input className={inp} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
            </div>

            {/* Password */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Password *</label>
                <input className={inp} type="password" required value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" /></div>
              <div><label className="block text-xs font-mono text-muted-foreground mb-1">Confirm Password *</label>
                <input className={inp} type="password" required value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" /></div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Registration Request'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href="/member/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

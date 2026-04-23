'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cpu, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function MemberLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(
        `/api/members?action=login&username=${encodeURIComponent(form.username)}&password=${encodeURIComponent(form.password)}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      // Store session
      sessionStorage.setItem('ethos_member', JSON.stringify(data.member))
      router.replace('/member/dashboard')
    } catch {
      setError('Could not reach server. Make sure npm run dev is running.')
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40'

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Cpu className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Et<span className="text-primary">HOS</span> Member Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your profile and submit content</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl shadow-black/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Username</label>
              <input type="text" required autoComplete="username" placeholder="your_username"
                value={form.username} onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError('') }}
                className={inp} />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  placeholder="••••••••" value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
                  className={`${inp} pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Not a member yet?{' '}
              <Link href="/member/register" className="text-primary hover:underline font-medium">Request access</Link>
            </p>
            <p className="text-xs text-muted-foreground/60">
              Demo: <span className="font-mono">arjun</span> / <span className="font-mono">Member@123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal →</Link>
        </p>
      </div>
    </div>
  )
}

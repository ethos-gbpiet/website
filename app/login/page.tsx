'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Cpu, Eye, EyeOff, AlertCircle, Loader2, Shield, Crown, User, BookOpen, GraduationCap } from 'lucide-react'
import { defaultPortal, type Role } from '@/lib/permissions'

const ROLES = [
  { key: 'member',      label: 'Member',      icon: User,           hint: 'Access your portal, projects & events' },
  { key: 'creator',     label: 'Creator',      icon: BookOpen,       hint: 'Manage bulletin, gallery & resources' },
  { key: 'faculty',     label: 'Faculty',      icon: GraduationCap,  hint: 'Coordinator overview & reports' },
  { key: 'admin',       label: 'Admin',        icon: Shield,         hint: 'Manage events, projects & members' },
  { key: 'super_admin', label: 'Super Admin',  icon: Crown,          hint: 'Full platform control' },
]

const inp = 'w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40'

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const callbackUrl = params.get('callbackUrl') ?? ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (!res?.ok) {
        setError(res?.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Sign-in failed. Try again.')
        setLoading(false)
        return
      }
      // Refresh session then redirect based on role
      const session = await getSession()
      const role = (session?.user as any)?.role as Role | undefined
      router.push(callbackUrl || (role ? defaultPortal(role) : '/member/dashboard'))
    } catch {
      setError('Could not connect. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-cyan hover:scale-105 transition-transform">
              <Cpu className="w-7 h-7 text-primary" />
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold">
            Et<span className="text-primary">HOS</span> Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {/* Role legend */}
        <div className="grid grid-cols-5 gap-1.5 mb-6">
          {ROLES.map(({ key, label, icon: Icon, hint }) => (
            <div key={key} title={hint}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors cursor-default">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[9px] font-mono text-muted-foreground/70 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl shadow-black/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className={`${inp} pr-10`}
                />
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
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 disabled:cursor-not-allowed transition-all glow-cyan shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              All roles use this single sign-in page.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Your account is created by a Super Admin or Admin.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { isAuthed } from '@/lib/store'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthed()) router.replace('/admin/dashboard')
    else setChecking(false)
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verify credentials against the server (reads from data/settings.json)
    fetch('/api/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(s => {
        const validUser = s.adminUsername || 'ethos_admin'
        const validPass = s.adminPassword || 'EtHOS@2025'
        if (username.trim() === validUser && password === validPass) {
          sessionStorage.setItem('ethos_admin_authed', 'true')
          router.replace('/admin/dashboard')
        } else {
          setError('Invalid username or password.')
          setLoading(false)
        }
      })
      .catch(() => {
        // Fallback to defaults if API unreachable
        if (username.trim() === 'ethos_admin' && password === 'EtHOS@2025') {
          sessionStorage.setItem('ethos_admin_authed', 'true')
          router.replace('/admin/dashboard')
        } else {
          setError('Invalid username or password.')
          setLoading(false)
        }
      })
  }

  if (checking) return null

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative">
      {/* Ambient glows */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Cpu className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">
            Et<span className="text-primary">HOS</span> Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Electronics &amp; Hardware Oriented Society
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-xl shadow-black/10">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold">Sign in to Admin Panel</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="ethos_admin"
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2.5 pr-10 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/85 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 glow-cyan shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Default credentials: <span className="font-mono text-primary">ethos_admin</span> / <span className="font-mono text-primary">EtHOS@2025</span>
            </p>
            <p className="text-xs text-muted-foreground/60 text-center mt-1">
              Change via Admin → Site Settings
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Session expires when you close the browser tab.
        </p>
      </div>
    </div>
  )
}

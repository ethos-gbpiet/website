'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { SiteProvider } from '@/lib/site-context'
import { Toaster } from '@/components/ui/toaster'

/**
 * Root client-side providers. Wrap the app once in `app/layout.tsx`.
 *
 *  - SessionProvider: NextAuth session for the entire client tree
 *  - ThemeProvider:   light/dark theme via next-themes
 *  - SiteProvider:    cached site settings, refreshed on `ethos-settings-updated`
 *  - Toaster:         global toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <SiteProvider>
          {children}
          <Toaster />
        </SiteProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

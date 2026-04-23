'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string
  siteTagline: string
  heroHeading: string[]
  heroSubtext: string
  aboutTitle: string
  aboutBody: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  contactHours: string
  github: string
  twitter: string
  linkedin: string
  collegeFullName: string
  foundedYear: string
  adminUsername?: string
  adminPassword?: string
}

export const defaultSettings: SiteSettings = {
  siteName: 'EtHOS',
  siteTagline: 'Electronics and Hardware Oriented Society',
  heroHeading: ['Design.', 'Build.', 'Power.'],
  heroSubtext:
    'EtHOS is the Electronics and Hardware Oriented Society of IET College. We design PCBs, build embedded systems, and push the boundaries of hardware engineering — from schematics to silicon.',
  aboutTitle: 'Where the schematic becomes real',
  aboutBody:
    'EtHOS is the dedicated electronics and hardware society of IET College, Dehradun. Founded to bridge the gap between classroom theory and real-world circuit design, we give students access to professional PCB tools, a fully-stocked component lab, and a community of engineers obsessed with making things work.',
  contactEmail: 'ethos@iet.edu',
  contactPhone: '+91 98765 43210',
  contactAddress: 'PCB Lab, Block D, IET College, Dehradun — 248001',
  contactHours: 'Mon – Sat, 10 AM – 8 PM',
  github: 'https://github.com/ethos-iet',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  collegeFullName: 'IET College, Dehradun',
  foundedYear: '2014',
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SiteContextValue {
  settings: SiteSettings
  loading: boolean
  saveSettings: (s: SiteSettings) => Promise<boolean>
  refreshSettings: () => Promise<void>
}

const SiteContext = createContext<SiteContextValue>({
  settings: defaultSettings,
  loading: true,
  saveSettings: async () => false,
  refreshSettings: async () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Fetch from the API (reads from disk — always up to date)
  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch {
      // Server not ready yet — keep defaults
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  // Save to API (writes to disk permanently)
  const saveSettings = useCallback(async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) return false
      const data = await res.json()
      if (data.ok) {
        setSettings({ ...defaultSettings, ...data.settings })
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  return (
    <SiteContext.Provider value={{ settings, loading, saveSettings, refreshSettings }}>
      {children}
    </SiteContext.Provider>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSiteSettings(): SiteSettings {
  return useContext(SiteContext).settings
}

export function useSiteContext(): SiteContextValue {
  return useContext(SiteContext)
}

'use client'

import { useState, useEffect } from 'react'

/**
 * Generic hook that fetches data from an API endpoint.
 * Falls back to `fallback` while loading or on error.
 *
 * Usage:
 *   const events = useApiData<Event[]>('/api/events', [])
 */
export function useApiData<T>(endpoint: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback)

  useEffect(() => {
    fetch(endpoint, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : fallback)
      .then(d => {
        // For arrays, only replace if non-empty
        if (Array.isArray(d) && d.length === 0) return
        setData(d)
      })
      .catch(() => {}) // keep fallback on network error
  }, [endpoint])

  return data
}

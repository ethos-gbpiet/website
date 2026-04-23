/**
 * Shared helper used by all API route handlers.
 * Reads/writes JSON files in the /data directory.
 * Runs only on the server (Node.js) — never imported by client components.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

export function readJson<T>(filename: string, fallback: T): T {
  try {
    const path = join(DATA_DIR, filename)
    if (!existsSync(path)) return fallback
    return { ...fallback as any, ...JSON.parse(readFileSync(path, 'utf-8')) } as T
  } catch {
    return fallback
  }
}

export function readJsonArray<T>(filename: string, fallback: T[]): T[] {
  try {
    const path = join(DATA_DIR, filename)
    if (!existsSync(path)) return fallback
    const data = JSON.parse(readFileSync(path, 'utf-8'))
    return Array.isArray(data) && data.length > 0 ? data : fallback
  } catch {
    return fallback
  }
}

export function writeJson(filename: string, data: unknown): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

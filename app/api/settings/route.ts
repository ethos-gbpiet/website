import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson, NO_CACHE } from '@/lib/api-data'
import { defaultSettings } from '@/lib/site-context'
export async function GET() {
  return NextResponse.json(readJson('settings.json', defaultSettings), { headers: NO_CACHE })
}
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const current = readJson('settings.json', defaultSettings)
    const merged = { ...current, ...b }
    writeJson('settings.json', merged)
    return NextResponse.json({ ok: true, settings: merged })
  } catch (e) { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }) }
}

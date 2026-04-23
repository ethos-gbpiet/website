import { NextRequest, NextResponse } from 'next/server'
import { readJsonArray, writeJson, NO_CACHE } from '@/lib/api-data'
import { events as seed } from '@/data'
export async function GET() {
  return NextResponse.json(readJsonArray('events.json', seed), { headers: NO_CACHE })
}
export async function POST(req: NextRequest) {
  try { const b = await req.json(); writeJson('events.json', b); return NextResponse.json({ ok: true }) }
  catch (e) { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }) }
}

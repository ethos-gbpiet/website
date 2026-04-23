import { NextRequest, NextResponse } from 'next/server'
import { readJsonArray, writeJson, NO_CACHE } from '@/lib/api-data'
import { defaultTeam } from '@/lib/store'
export async function GET() {
  return NextResponse.json(readJsonArray('team.json', defaultTeam), { headers: NO_CACHE })
}
export async function POST(req: NextRequest) {
  try { const b = await req.json(); writeJson('team.json', b); return NextResponse.json({ ok: true }) }
  catch (e) { return NextResponse.json({ ok: false, error: String(e) }, { status: 500 }) }
}

import { NextResponse } from 'next/server'

export async function POST() {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL
  if (!hookUrl) {
    return NextResponse.json({ error: 'Build hook URL not configured' }, { status: 500 })
  }

  const res = await fetch(hookUrl, { method: 'POST' })

  if (!res.ok) {
    return NextResponse.json({ error: `Netlify returned ${res.status}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

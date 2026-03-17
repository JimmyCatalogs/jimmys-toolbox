import { NextResponse } from 'next/server'

const TRELLO_URL = 'https://trello.com/b/sAe6Cfbw.json'

export async function GET() {
  try {
    const res = await fetch(TRELLO_URL, { cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Trello returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Trello fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch Trello board' }, { status: 500 })
  }
}

import holidays from '@/data/daily-holidays.json'

export type HolidayEntry = {
  name: string
  wikipedia: string
  link: string
}

export function getTodaysHoliday(): HolidayEntry | null {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const mm = parts.find(p => p.type === 'month')!.value
  const dd = parts.find(p => p.type === 'day')!.value
  const key = `${mm}-${dd}` as keyof typeof holidays
  return (holidays[key] as HolidayEntry) ?? null
}

export async function getHolidayImageUrl(): Promise<string | null> {
  const holiday = getTodaysHoliday()
  if (!holiday) return null
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(holiday.wikipedia)}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.originalimage?.source ?? data?.thumbnail?.source ?? null
  } catch {
    return null
  }
}

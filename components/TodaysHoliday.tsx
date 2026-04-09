import { getTodaysHoliday } from '@/lib/daily-holiday'

export default async function TodaysHoliday() {
  const holiday = getTodaysHoliday()
  if (!holiday) return null

  // Fetch is deduped by Next.js — same URL + options as layout.tsx call
  const wiki = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(holiday.wikipedia)}`,
    { next: { revalidate: 86400 } }
  ).then(r => r.ok ? r.json() : null).catch(() => null)

  const extract: string | null = wiki?.extract
    ? wiki.extract.split('. ').slice(0, 2).join('. ') + '.'
    : null

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-amber-200 dark:border-amber-700/60 rounded-xl shadow-sm p-6 flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
          Today&apos;s Holiday
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {holiday.name}
        </h3>
        {extract && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {extract}
          </p>
        )}
      </div>
      <a
        href={holiday.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors w-fit"
      >
        Learn more
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </div>
  )
}

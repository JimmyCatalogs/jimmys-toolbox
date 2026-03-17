import Link from 'next/link'

const sections = [
  {
    title: 'Catalogs.com',
    href: '/catalogs',
    description: 'Tools for managing catalog-related work including PDF scanning, SKU extraction, and supplier workflows.',
    tools: ['PDF SKU Scanner'],
    color: 'indigo',
  },
  {
    title: 'EZ-Advisors',
    href: '/ez-advisors',
    description: 'Tools for EZ-Advisors operations including board management, backups, and internal workflows.',
    tools: ['Trello Backup Search'],
    color: 'violet',
  },
]

const colorMap: Record<string, { card: string; badge: string; link: string }> = {
  indigo: {
    card: 'border-indigo-200 dark:border-indigo-700/60',
    badge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    link: 'bg-indigo-600 hover:bg-indigo-700',
  },
  violet: {
    card: 'border-violet-200 dark:border-violet-700/60',
    badge: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    link: 'bg-violet-600 hover:bg-violet-700',
  },
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Select a section below to access its tools and automations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sections.map((section) => {
          const colors = colorMap[section.color]
          return (
            <div
              key={section.href}
              className={`bg-white dark:bg-slate-900 border ${colors.card} rounded-xl shadow-sm p-6 flex flex-col gap-4`}
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.tools.map((tool) => (
                  <span
                    key={tool}
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <Link
                href={section.href}
                className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white ${colors.link} transition-colors`}
              >
                Open {section.title}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tools = [
  { label: 'PDF SKU Scanner', href: '/catalogs/pdf-scanner' },
  { label: 'Weekly Leads Email', href: '/catalogs/weekly-leads' },
]

export default function CatalogsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Catalogs.com</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tools for catalog-related work and supplier workflows.</p>
      </div>

      <nav className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700/60 pb-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-3">
          Tools
        </span>
        {tools.map((tool) => {
          const active = pathname === tool.href
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`px-3.5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tool.label}
            </Link>
          )
        })}
      </nav>

      <div>{children}</div>
    </div>
  )
}

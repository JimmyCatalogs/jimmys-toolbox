import { ReactNode } from 'react'

interface ToolCardProps {
  title: string
  description: string
  basecampUrl?: string
  children: ReactNode
}

export default function ToolCard({ title, description, basecampUrl, children }: ToolCardProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm">
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/60">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {basecampUrl && (
          <a
            href={basecampUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/60 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Basecamp
          </a>
        )}
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  )
}

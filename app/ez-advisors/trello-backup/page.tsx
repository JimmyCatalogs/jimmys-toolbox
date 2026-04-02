import Link from 'next/link'
import ToolCard from '@/components/ToolCard'
import TrelloBackup from '@/components/TrelloBackup'

export default function TrelloBackupPage() {
  return (
    <div>
      <Link
        href="/ez-advisors"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tools
      </Link>
      <ToolCard
        title="Trello Backup Search"
        description="Upload a saved Trello board JSON backup and search through cards by name, description, list, or label."
        basecampUrl=""
      >
        <TrelloBackup />
      </ToolCard>
    </div>
  )
}

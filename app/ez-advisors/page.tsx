import ToolCard from '@/components/ToolCard'
import TrelloBackup from '@/components/TrelloBackup'

export default function EZAdvisorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">EZ-Advisors</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tools for EZ-Advisors operations and board management.</p>
      </div>

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

import ToolCard from '@/components/ToolCard'
import WeeklyLeadsEmail from '@/components/WeeklyLeadsEmail'

export default function WeeklyLeadsPage() {
  return (
    <ToolCard
      title="Weekly Leads Email"
      description="Send weekly lead count emails to all catalog partners via SendGrid."
      basecampUrl=""
    >
      <WeeklyLeadsEmail />
    </ToolCard>
  )
}

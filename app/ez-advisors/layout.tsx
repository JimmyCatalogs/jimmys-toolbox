export default function EZAdvisorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">EZ-Advisors</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tools for EZ-Advisors operations and board management.</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function CatalogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Catalogs.com</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tools for catalog-related work and supplier workflows.</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

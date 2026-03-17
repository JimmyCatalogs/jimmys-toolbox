import ToolCard from '@/components/ToolCard'
import PDFSKUScanner from '@/components/PDFSKUScanner'

export default function CatalogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Catalogs.com</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Tools for catalog-related work and supplier workflows.</p>
      </div>

      <ToolCard
        title="PDF SKU Scanner"
        description="Upload a catalog PDF and extract all SKUs with direct search links. Supports Herrschners and Vesey's."
        basecampUrl=""
      >
        <PDFSKUScanner />
      </ToolCard>
    </div>
  )
}

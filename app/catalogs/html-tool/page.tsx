import Link from 'next/link'
import ToolCard from '@/components/ToolCard'
import CatalogHTMLTool from '@/components/CatalogHTMLTool'

export default function HTMLToolPage() {
  return (
    <div>
      <Link
        href="/catalogs"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tools
      </Link>
      <ToolCard
        title="HTML Catalog Tool"
        description="Upload catalog images to S3 and update HTML files to use the new public URLs."
        basecampUrl=""
      >
        <CatalogHTMLTool />
      </ToolCard>
    </div>
  )
}

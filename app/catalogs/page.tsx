import Link from 'next/link'

const tools = [
  {
    label: 'PDF SKU Scanner',
    description: 'Upload a catalog PDF and extract all SKUs with direct search links. Supports Herrschners and Vesey\'s.',
    href: '/catalogs/pdf-scanner',
  },
  {
    label: 'Weekly Leads Email',
    description: 'Send weekly lead count emails to all catalog partners via SendGrid.',
    href: '/catalogs/weekly-leads',
  },
  {
    label: 'HTML Tool',
    description: 'Upload catalog images to S3 and update HTML files with new URLs.',
    href: '/catalogs/html-tool',
  },
  {
    label: 'PDF Upload',
    description: 'Upload PDFs to S3 and copy their public URLs.',
    href: '/catalogs/pdf-upload',
  },
  {
    label: 'Redeploy Website',
    description: 'Trigger a new production build on Netlify for the Catalogs.com website.',
    href: '/catalogs/redeploy',
  },
]

export default function CatalogsPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.label}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
            </div>
            <svg
              className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mt-0.5 flex-shrink-0 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}

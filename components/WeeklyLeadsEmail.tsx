'use client'

import { useState, useEffect, useRef } from 'react'

const DEFAULT_SLUGS = [
  'bargain-shopping',
  'herrschners-catalog',
  'jessica-london',
  'florida-oranges',
  'movies-unlimited-catalog',
  'buy-smoked-meats',
  'museum-gifts',
  'luxury-timepieces',
  'veseys-Catalogue',
  'video-collection-catalog',
  'woman-within',
  'critics-choice-video-catalog',
  'shooting-arrows',
  'rosarycard.net',
  'collectors-choice-music-catalog',
  'garage-organization-products',
  'positive-promotions-promo-code',
  'business-promotional-products',
  'water-purifier',
]

const DEFAULT_TEMPLATE = `TO: {catalog}<br/>

CONTACT: {email}<br/>
PERIOD: As of {sendDate},  there are {numberOfLeads} new leads for this catalog, and the oldest one that has not been exported yet is dated  {oldestLeadDate}. <br/>
NOTE: If these numbers look very off, it could be because
we have now fully converted to our new portal, detailed below. If you have never downloaded your leads from the portal, your last pickup date and lead count may be initially very high. It should stabilize after your first download. If you continue to experience inaccuracies, please reach out to us. <br/>

<br/>
WEBSITE: Leads are now found at <a href="https://portal.catalogshub.com/leads">our portal</a>. For a guide on how to retrieve leads in the portal, see <a href="https://docs.google.com/document/d/1ILONUzvMtSmKyUezRUA4sYtLFfMEFWAh_jM22IJ4BHI/edit?usp=sharing">this document</a> <br/>
<br/>
LOGIN: We now require a Google account sign-in using an email associated with your account. If your email is not working, or if you would like to edit your account emails, please reach out to jimmyw@catalogs.com or bibic@catalogs.com<br/>
<br/>
<br/>
We are constantly monitoring the landing page for your catalog and are aware that you may have important changes.  Please make sure that the information is accurate. <br/>
<br/>
Here are your contacts for updating your catalog cover, digital catalog and offer codes:<br/>
<br/>
Bibi Chand<br/>
<br/>
bibic@catalogs.com<br/>
<br/>
954-908-7202<br/>
<br/>
<br/>
Jimmy Watson<br/>
<br/>
jimmyw@catalogs.com`

interface CatalogResult {
  slug: string
  catalog: string
  email: string
  leads: number
  oldestLeadDate: string
  success: boolean
  error?: string
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function WeeklyLeadsEmail() {
  const [slugs, setSlugs] = useState<string[]>(DEFAULT_SLUGS)
  const [emailTemplate, setEmailTemplate] = useState(DEFAULT_TEMPLATE)
  const [newSlug, setNewSlug] = useState('')
  const [slugPanelOpen, setSlugPanelOpen] = useState(false)
  const [templatePanelOpen, setTemplatePanelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CatalogResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const newSlugRef = useRef<HTMLInputElement>(null)

  // Load persisted config from localStorage
  useEffect(() => {
    try {
      const storedSlugs = localStorage.getItem('wle_slugs')
      const storedTemplate = localStorage.getItem('wle_template')
      if (storedSlugs) setSlugs(JSON.parse(storedSlugs))
      if (storedTemplate) setEmailTemplate(storedTemplate)
    } catch {
      // ignore
    }
  }, [])

  function persistSlugs(updated: string[]) {
    setSlugs(updated)
    localStorage.setItem('wle_slugs', JSON.stringify(updated))
  }

  function persistTemplate(updated: string) {
    setEmailTemplate(updated)
    localStorage.setItem('wle_template', updated)
  }

  function addSlug() {
    const slug = newSlug.trim()
    if (!slug || slugs.includes(slug)) return
    persistSlugs([...slugs, slug])
    setNewSlug('')
    newSlugRef.current?.focus()
  }

  function removeSlug(index: number) {
    persistSlugs(slugs.filter((_, i) => i !== index))
  }

  function resetSlugs() {
    persistSlugs(DEFAULT_SLUGS)
  }

  function resetTemplate() {
    persistTemplate(DEFAULT_TEMPLATE)
  }

  async function handleSend() {
    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const res = await fetch('/api/weekly-leads-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs, emailTemplate }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data: CatalogResult[] = await res.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const successCount = results?.filter((r) => r.success).length ?? 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Sends a weekly lead count email to each catalog partner via SendGrid. Each email includes
        the number of new (un-exported) leads and the date of the oldest pending lead.
      </p>

      {/* Config: Slug List */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <button
          onClick={() => setSlugPanelOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Configure Slug List</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">({slugs.length} catalogs)</span>
          </div>
          <ChevronIcon open={slugPanelOpen} />
        </button>

        {slugPanelOpen && (
          <div className="px-4 py-4 space-y-3 border-t border-slate-200 dark:border-slate-700/60">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each slug corresponds to a catalog&apos;s URL identifier on Catalogs.com. You can find the full list of active slugs in the{' '}
              <strong>CCC (Catalog Control Center)</strong>. Changes are saved locally and used on your next send.
            </p>

            <ul className="space-y-1.5">
              {slugs.map((slug, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-sm font-mono text-slate-700 dark:text-slate-300"
                >
                  <span>{slug}</span>
                  <button
                    onClick={() => removeSlug(i)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label={`Remove ${slug}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                ref={newSlugRef}
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSlug()}
                placeholder="new-catalog-slug"
                className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addSlug}
                disabled={!newSlug.trim()}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                Add
              </button>
            </div>

            <button
              onClick={resetSlugs}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
            >
              Reset to defaults ({DEFAULT_SLUGS.length} slugs)
            </button>
          </div>
        )}
      </div>

      {/* Config: Email Body */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        <button
          onClick={() => setTemplatePanelOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Configure Email Body</span>
          <ChevronIcon open={templatePanelOpen} />
        </button>

        {templatePanelOpen && (
          <div className="px-4 py-4 space-y-3 border-t border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>Edit the HTML email body. Use these placeholders — they will be replaced with live data when sent:</p>
              <ul className="grid grid-cols-2 gap-x-4 mt-1">
                {['{catalog}', '{email}', '{numberOfLeads}', '{oldestLeadDate}', '{sendDate}'].map((v) => (
                  <li key={v} className="font-mono text-indigo-600 dark:text-indigo-400">{v}</li>
                ))}
              </ul>
            </div>

            <textarea
              value={emailTemplate}
              onChange={(e) => persistTemplate(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              spellCheck={false}
            />

            <button
              onClick={resetTemplate}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
            >
              Reset to default template
            </button>
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={loading || slugs.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {loading ? `Sending emails…` : `Send Weekly Emails (${slugs.length})`}
      </button>

      {/* Fatal error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {(() => {
            const failCount = results.length - successCount
            if (failCount === 0) {
              return (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/60 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {successCount}/{results.length} emails sent successfully
                </div>
              )
            } else if (successCount === 0) {
              return (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400">
                  0/{results.length} sent — all emails failed
                </div>
              )
            } else {
              return (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-400">
                  {successCount}/{results.length} sent — {failCount} failed
                </div>
              )
            }
          })()}

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Catalog</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5 text-right">Leads</th>
                  <th className="px-4 py-2.5">Oldest Lead</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {results.map((r) => (
                  <tr
                    key={r.slug}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{r.catalog}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{r.email || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-300">{r.leads}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{r.oldestLeadDate}</td>
                    <td className="px-4 py-2.5">
                      {r.success ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          Sent
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            Error
                          </span>
                          {r.error && (
                            <p className="text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={r.error}>
                              {r.error}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { CLIENT_CONFIGS, ClientKey, SkuResult } from '@/lib/sku-extractor'

export default function PDFSKUScanner() {
  const [client, setClient] = useState<ClientKey>('herrschners')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{ skus: SkuResult[]; pdfName: string; totalPages: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleScan() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('client', client)

      const res = await fetch('/api/tools/pdf-sku-scanner', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Unknown error')
      } else {
        setResults(data)
      }
    } catch {
      setError('Request failed — check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadExcel() {
    if (!results) return

    // Dynamically import xlsx to keep it out of the server bundle
    import('xlsx').then((XLSX) => {
      const worksheetData = [
        ['SKU', 'Search SKU', 'Search URL'],
        ...results.skus.map((r) => [r.sku, r.searchSku, r.searchUrl]),
      ]

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Column widths
      worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 70 }]

      XLSX.utils.book_append_sheet(workbook, worksheet, 'SKUs')

      const baseName = results.pdfName.replace(/\.pdf$/i, '')
      XLSX.writeFile(workbook, `${baseName}-SKUs.xlsx`)
    })
  }

  function handleReset() {
    setFile(null)
    setResults(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Client
          </label>
          <select
            value={client}
            onChange={(e) => setClient(e.target.value as ClientKey)}
            className="block w-44 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(Object.keys(CLIENT_CONFIGS) as ClientKey[]).map((key) => (
              <option key={key} value={key}>
                {CLIENT_CONFIGS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-60">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            PDF File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResults(null)
              setError(null)
            }}
            className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 cursor-pointer"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Scanning…' : 'Scan PDF'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Found <span className="font-semibold text-slate-900 dark:text-slate-100">{results.skus.length}</span> unique SKUs
              in <span className="font-medium">{results.pdfName}</span>
              <span className="ml-1 text-slate-400">({results.totalPages} pages)</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadExcel}
                disabled={results.skus.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Excel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {results.skus.length === 0 ? (
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              No SKUs matching the {CLIENT_CONFIGS[client].label} pattern were found in this PDF.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/60">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-32">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-36">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-36">Search SKU</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Search URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {results.skus.map((row, i) => (
                    <tr key={row.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900 dark:text-slate-100">{row.sku}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{row.searchSku}</td>
                      <td className="px-4 py-2.5">
                        <a
                          href={row.searchUrl.startsWith('http') ? row.searchUrl : `https://${row.searchUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                        >
                          {row.searchUrl}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

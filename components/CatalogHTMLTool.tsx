'use client'

import { useState, useRef, DragEvent } from 'react'

const PRESET_PATHS = [
  { label: 'Real Estate — Beachfront', value: 'realestate/beachfront' },
  { label: 'Herrschners — PDFs', value: 'herrschners/pdfs' },
  { label: 'Custom…', value: '__custom__' },
]

const MONTHS = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
]

function buildYears() {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1]
}

type UploadResult = { name: string; success: boolean; error?: string }

export default function CatalogHTMLTool() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [pathPreset, setPathPreset] = useState(PRESET_PATHS[0].value)
  const [customPath, setCustomPath] = useState('')
  const [locked, setLocked] = useState(false)

  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])

  const [htmlFile, setHtmlFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [htmlError, setHtmlError] = useState('')

  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const htmlInputRef = useRef<HTMLInputElement>(null)

  function handleDragEnter(e: DragEvent) {
    e.preventDefault()
    dragCounter.current++
    if (dragCounter.current === 1) setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  function handleImageDrop(e: DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length === 0) return
    const dt = new DataTransfer()
    files.forEach((f) => dt.items.add(f))
    setImageFiles(dt.files)
  }

  const clientPath = pathPreset === '__custom__' ? customPath.trim() : pathPreset
  const dateFolder = `${month}-${year.slice(-2)}`
  const s3BaseUrl = `https://s3.us-east-1.amazonaws.com/digital.catalogs.com/emails/${clientPath}/${dateFolder}/`

  function handleLock() {
    if (!clientPath) return
    setLocked(true)
    setUploadResults([])
    setHtmlError('')
  }

  function handleUnlock() {
    setLocked(false)
    setUploadResults([])
    setHtmlError('')
  }

  async function handleImageUpload() {
    if (!imageFiles || imageFiles.length === 0) return
    setUploading(true)
    setUploadResults([])
    setUploadProgress(0)
    setUploadTotal(imageFiles.length)

    const results: UploadResult[] = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const formData = new FormData()
      formData.append('action', 'upload-images')
      formData.append('month', month)
      formData.append('year', year)
      formData.append('clientPath', clientPath)
      formData.append('file', file)

      try {
        const res = await fetch('/api/catalog-html', { method: 'POST', body: formData })
        const json = await res.json()
        if (res.ok) {
          results.push({ name: file.name, success: true })
        } else {
          results.push({ name: file.name, success: false, error: json.error ?? 'Upload failed' })
        }
      } catch {
        results.push({ name: file.name, success: false, error: 'Network error' })
      }

      setUploadProgress(i + 1)
      setUploadResults([...results])
    }

    setUploading(false)
  }

  async function handleProcessHTML() {
    if (!htmlFile) return
    setProcessing(true)
    setHtmlError('')

    const formData = new FormData()
    formData.append('action', 'process-html')
    formData.append('month', month)
    formData.append('year', year)
    formData.append('clientPath', clientPath)
    formData.append('file', htmlFile)

    try {
      const res = await fetch('/api/catalog-html', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json()
        setHtmlError(json.error ?? 'Processing failed')
        setProcessing(false)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = htmlFile.name.replace(/\.html?$/i, '_updated.html')
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setHtmlError('Network error')
    }

    setProcessing(false)
  }

  const successCount = uploadResults.filter((r) => r.success).length
  const failCount = uploadResults.filter((r) => !r.success).length

  return (
    <div className="space-y-8">
      {/* Step 1 — Configure */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 1 — Configure
        </h3>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={locked}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm disabled:opacity-50"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={locked}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm disabled:opacity-50"
            >
              {buildYears().map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Client Path</label>
            <select
              value={pathPreset}
              onChange={(e) => setPathPreset(e.target.value)}
              disabled={locked}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm disabled:opacity-50"
            >
              {PRESET_PATHS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {pathPreset === '__custom__' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Custom path <span className="text-slate-400 font-normal">(e.g. realestate/beachfront)</span>
              </label>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                disabled={locked}
                placeholder="category/client"
                className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm w-56 disabled:opacity-50"
              />
            </div>
          )}

          {!locked ? (
            <button
              onClick={handleLock}
              disabled={!clientPath}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={handleUnlock}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {locked && (
          <div className="rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">S3 folder:</span>{' '}
            <code className="text-indigo-600 dark:text-indigo-400 text-xs break-all">
              emails/{clientPath}/{dateFolder}/
            </code>
          </div>
        )}
      </section>

      {/* Step 2 — Upload Images */}
      <section className={`space-y-4 ${!locked ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 2 — Upload Images
        </h3>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(e.target.files)}
          className="hidden"
        />

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleImageDrop}
          onClick={() => imageInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isDragging
              ? 'Drop images here'
              : imageFiles && imageFiles.length > 0
              ? `${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected — click to change`
              : 'Drop images here, or click to select'}
          </p>
        </div>

        <button
          onClick={handleImageUpload}
          disabled={!imageFiles || imageFiles.length === 0 || uploading}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? `Uploading ${uploadProgress} of ${uploadTotal}…` : 'Upload to S3'}
        </button>

        {uploadResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {successCount} uploaded{failCount > 0 && `, ${failCount} failed`}
            </p>
            <ul className="max-h-48 overflow-y-auto space-y-1 rounded-md border border-slate-200 dark:border-slate-700 p-2 text-sm">
              {uploadResults.map((r) => (
                <li key={r.name} className="flex items-center gap-2">
                  <span className={r.success ? 'text-green-500' : 'text-red-500'}>
                    {r.success ? '✓' : '✗'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate">{r.name}</span>
                  {r.error && <span className="text-red-400 text-xs">{r.error}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Step 3 — Process HTML */}
      <section className={`space-y-4 ${!locked ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 3 — Process HTML
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload the HTML file. All <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">src="images/…"</code> references will be rewritten to use the S3 URL, then the updated file will download automatically.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            ref={htmlInputRef}
            type="file"
            accept=".html,.htm"
            onChange={(e) => {
              setHtmlFile(e.target.files?.[0] ?? null)
              setHtmlError('')
            }}
            className="hidden"
          />
          <button
            onClick={() => htmlInputRef.current?.click()}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {htmlFile ? htmlFile.name : 'Select HTML File'}
          </button>

          <button
            onClick={handleProcessHTML}
            disabled={!htmlFile || processing}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing…' : 'Process & Download'}
          </button>
        </div>

        {htmlError && (
          <p className="text-sm text-red-500">{htmlError}</p>
        )}
      </section>
    </div>
  )
}

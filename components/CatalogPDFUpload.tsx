'use client'

import { useState, useRef, useEffect, useCallback, DragEvent } from 'react'

const DIRECTORIES = [
  { label: 'General', folder: 'pdfs' },
  { label: 'Herrschners', folder: 'herrschners/pdfs' },
]

const BUCKET = 'digital.catalogs.com'
const REGION = 'us-east-1'

function s3Url(folder: string, filename: string) {
  return `https://s3.${REGION}.amazonaws.com/${BUCKET}/${folder}/${filename}`
}

type PDFItem = { name: string; url: string }
type UploadResult = { name: string; success: boolean; error?: string }

export default function CatalogPDFUpload() {
  const [activeFolder, setActiveFolder] = useState(DIRECTORIES[0].folder)
  const [pdfList, setPdfList] = useState<PDFItem[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState('')

  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])

  const [copiedUrl, setCopiedUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.pdf')
    )
    if (files.length === 0) return
    const dt = new DataTransfer()
    files.forEach((f) => dt.items.add(f))
    setUploadFiles(dt.files)
    setUploadResults([])
  }

  const fetchList = useCallback(async (folder: string) => {
    setLoadingList(true)
    setListError('')
    setPdfList([])
    try {
      const res = await fetch(`/api/catalog-pdfs?folder=${encodeURIComponent(folder)}`)
      const json = await res.json()
      if (!res.ok) {
        setListError(json.error ?? 'Failed to load files')
      } else {
        setPdfList(json.files)
      }
    } catch {
      setListError('Network error')
    }
    setLoadingList(false)
  }, [])

  useEffect(() => {
    fetchList(activeFolder)
  }, [activeFolder, fetchList])

  function handleDirectoryChange(folder: string) {
    setActiveFolder(folder)
    setUploadFiles(null)
    setUploadResults([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleUpload() {
    if (!uploadFiles || uploadFiles.length === 0) return
    setUploading(true)
    setUploadResults([])
    setUploadProgress(0)
    setUploadTotal(uploadFiles.length)

    const results: UploadResult[] = []

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i]
      const formData = new FormData()
      formData.append('folder', activeFolder)
      formData.append('file', file)

      try {
        const res = await fetch('/api/catalog-pdfs', { method: 'POST', body: formData })
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

    // Refresh the list after uploading
    await fetchList(activeFolder)
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(''), 2000)
  }

  const successCount = uploadResults.filter((r) => r.success).length
  const failCount = uploadResults.filter((r) => !r.success).length

  return (
    <div className="space-y-8">
      {/* Directory selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-1">Directory:</span>
        {DIRECTORIES.map((dir) => (
          <button
            key={dir.folder}
            onClick={() => handleDirectoryChange(dir.folder)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFolder === dir.folder
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {dir.label}
          </button>
        ))}
        <code className="ml-2 text-xs text-slate-400 dark:text-slate-500">/{activeFolder}/</code>
      </div>

      {/* Upload section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Upload PDFs
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => {
            setUploadFiles(e.target.files)
            setUploadResults([])
          }}
          className="hidden"
        />

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isDragging
              ? 'Drop PDFs here'
              : uploadFiles && uploadFiles.length > 0
              ? `${uploadFiles.length} PDF${uploadFiles.length > 1 ? 's' : ''} selected — click to change`
              : 'Drop PDFs here, or click to select'}
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!uploadFiles || uploadFiles.length === 0 || uploading}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? `Uploading ${uploadProgress} of ${uploadTotal}…` : 'Upload to S3'}
        </button>

        {uploadResults.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {successCount} uploaded{failCount > 0 && `, ${failCount} failed`}
            </p>
            <ul className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-slate-200 dark:border-slate-700 p-2 text-sm">
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

      {/* File list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Files in /{activeFolder}/
          </h3>
          <button
            onClick={() => fetchList(activeFolder)}
            disabled={loadingList}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40"
          >
            {loadingList ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {listError && (
          <p className="text-sm text-red-500">{listError}</p>
        )}

        {!loadingList && !listError && pdfList.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">No PDFs found in this folder.</p>
        )}

        {pdfList.length > 0 && (
          <ul className="space-y-1">
            {pdfList.map((pdf) => (
              <li key={pdf.url}>
                <button
                  onClick={() => handleCopy(pdf.url)}
                  title={pdf.url}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left group transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{pdf.name}</span>
                  <span className={`text-xs shrink-0 font-medium transition-colors ${
                    copiedUrl === pdf.url
                      ? 'text-green-500'
                      : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                  }`}>
                    {copiedUrl === pdf.url ? 'Copied!' : 'Copy URL'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

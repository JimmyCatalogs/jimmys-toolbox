'use client'

import { useState, useRef } from 'react'

interface TrelloCard {
  id: string
  name: string
  desc: string
  idList: string
  labels: { name: string; color: string }[]
  closed: boolean
}

interface TrelloList {
  id: string
  name: string
}

interface TrelloBoard {
  name: string
  cards: TrelloCard[]
  lists: TrelloList[]
}

interface SearchResult {
  card: TrelloCard
  listName: string
}

const LABEL_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  black: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
}

function ClipboardIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function TrelloBackup() {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [board, setBoard] = useState<TrelloBoard | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Download ---
  async function handleDownload() {
    setDownloading(true)
    setDownloadError(null)
    try {
      const res = await fetch('/api/tools/trello-backup')
      if (!res.ok) {
        const data = await res.json()
        setDownloadError(data.error ?? `Error ${res.status}`)
        return
      }
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `trello-backup-${dateStr}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('Request failed — check your connection and try again.')
    } finally {
      setDownloading(false)
    }
  }

  // --- Upload & Search ---
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setBoard(null)
    setSearchQuery('')
    setExpandedRows(new Set())

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as TrelloBoard
        if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.lists)) {
          setUploadError('This does not appear to be a valid Trello board JSON file.')
          return
        }
        setBoard(parsed)
      } catch {
        setUploadError('Could not parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500)
    })
  }

  function getSearchResults(): SearchResult[] {
    if (!board || !searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const listMap = new Map(board.lists.map((l) => [l.id, l.name]))

    return board.cards
      .filter((card) => !card.closed)
      .filter((card) => {
        const listName = listMap.get(card.idList) ?? ''
        return (
          card.name.toLowerCase().includes(q) ||
          card.desc.toLowerCase().includes(q) ||
          listName.toLowerCase().includes(q) ||
          card.labels.some((label) => label.name.toLowerCase().includes(q))
        )
      })
      .map((card) => ({
        card,
        listName: listMap.get(card.idList) ?? '(Unknown List)',
      }))
  }

  const searchResults = getSearchResults()

  return (
    <div className="space-y-8">
      {/* Section 1: Download */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Download Current Backup
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? 'Fetching…' : 'Download Backup'}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Saves the current board state as <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">trello-backup-YYYY-MM-DD.json</code>
          </p>
        </div>
        {downloadError && (
          <div className="mt-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {downloadError}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700/60" />

      {/* Section 2: Search */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Search Existing Backup
        </h3>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div className="flex-1 min-w-60">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Upload JSON File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 cursor-pointer"
            />
          </div>

          {board && (
            <div className="flex-1 min-w-60">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards, lists, labels…"
                className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {uploadError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {uploadError}
          </div>
        )}

        {board && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Loaded: <span className="font-medium text-slate-900 dark:text-slate-100">{board.name}</span>
            {' — '}
            {board.cards.filter((c) => !c.closed).length} active cards across {board.lists.length} lists
          </div>
        )}

        {board && searchQuery.trim() && (
          <div className="space-y-2">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {searchResults.length === 0
                ? 'No cards match your search.'
                : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
            </div>

            {searchResults.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/60">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="w-8 px-2 py-3" />
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Card Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-44">List</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-44">Labels</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {searchResults.map(({ card, listName }) => {
                      const isExpanded = expandedRows.has(card.id)
                      const isCopied = copiedId === card.id
                      const isCopiedName = copiedId === card.id + '_name'
                      return (
                        <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 align-top">
                          {/* Expand chevron */}
                          <td className="px-2 py-3 text-center">
                            <button
                              onClick={() => toggleRow(card.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>

                          {/* Card name + copy */}
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                            <div className="flex items-start gap-2">
                              <span className="flex-1">{card.name}</span>
                              <button
                                onClick={() => copyText(card.id + '_name', card.name)}
                                className="flex-shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Copy card name"
                              >
                                {isCopiedName ? <CheckIcon /> : <ClipboardIcon />}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{listName}</td>

                          {/* Labels */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {card.labels.filter((l) => l.name).map((label, i) => (
                                <span
                                  key={i}
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${LABEL_COLORS[label.color] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Description + expand + copy */}
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs">
                            <div className="flex items-start gap-2">
                              <span className={`flex-1 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                                {card.desc || <span className="text-slate-300 dark:text-slate-600 italic">No description</span>}
                              </span>
                              {card.desc && (
                                <button
                                  onClick={() => copyText(card.id, card.desc)}
                                  className="flex-shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                  title="Copy description"
                                >
                                  {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

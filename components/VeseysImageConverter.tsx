'use client'

import { useState, useCallback } from 'react'

const DEFAULT_FIND = 'small_image/320x/925f46717e92fbc24a8e2d03b22927e1'
const DEFAULT_REPLACE = 'image/700x700/e9c3970ab036de70892d86c6d221abfe'

function convertUrl(url: string, find: string, replace: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (!find) return trimmed

  // Remove the cache segment: .../cache/<hash>/<type>/<size>/... → .../...
  // Strategy: replace everything between the find token up to and including the next
  // path segment(s) that look like cache artifacts (hash + optional type/size folders),
  // collapsing them into replace. We do a simple literal find-replace so the user
  // can tune it if needed.
  return trimmed.split(find).join(replace)
}

export default function VeseysImageConverter() {
  const [input, setInput] = useState('')
  const [find, setFind] = useState(DEFAULT_FIND)
  const [replace, setReplace] = useState(DEFAULT_REPLACE)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = useCallback(() => {
    const lines = input.split('\n')
    const result = lines
      .map((line) => convertUrl(line, find, replace))
      .join('\n')
    setOutput(result)
    setCopied(false)
  }, [input, find, replace])

  const copyOutput = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setCopied(false)
  }, [])

  const inputLineCount = input.split('\n').filter((l) => l.trim()).length
  const outputLineCount = output.split('\n').filter((l) => l.trim()).length

  return (
    <div className="space-y-5">
      {/* Find / Replace pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Find (in URL)
          </label>
          <input
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="/cache/"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Replace with
          </label>
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="/"
          />
        </div>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Thumbnail URLs{inputLineCount > 0 && ` (${inputLineCount} URL${inputLineCount !== 1 ? 's' : ''})`}
          </label>
          {(input || output) && (
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste one URL per line…"
          className="w-full px-3 py-2.5 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      {/* Convert button */}
      <button
        onClick={convert}
        disabled={!input.trim() || !find}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        Convert URLs
      </button>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Full-size URLs{outputLineCount > 0 && ` (${outputLineCount} URL${outputLineCount !== 1 ? 's' : ''})`}
            </label>
            <button
              onClick={copyOutput}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy all
                </>
              )}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="w-full px-3 py-2.5 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
          />
        </div>
      )}
    </div>
  )
}

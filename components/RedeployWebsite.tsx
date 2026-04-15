'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function RedeployWebsite() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleRedeploy() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/netlify-redeploy', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Unknown error')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error — could not reach the server.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Triggers a new production build on Netlify for the Catalogs.com website. The site typically deploys within 1–2 minutes.
      </p>

      <button
        onClick={handleRedeploy}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Triggering build…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Redeploy Website
          </>
        )}
      </button>

      {status === 'success' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/60 text-sm text-green-800 dark:text-green-300">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Build triggered successfully. Check Netlify for deploy status.
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 text-sm text-red-800 dark:text-red-300">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {errorMsg || 'Failed to trigger build.'}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Country, BusinessLinks, UserPreferences } from '../types'
import { getITARStatus } from '../utils/itarStatus'

interface Props {
  country: Country
  businessLinks: BusinessLinks | null
  onClose: () => void
  userPrefs?: UserPreferences
}

function mdToHtml(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let inUl = false
  let inOl = false

  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false }
    if (inOl) { out.push('</ol>'); inOl = false }
  }

  const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('## ')) {
      closeLists()
      out.push(`<h2>${bold(line.slice(3))}</h2>`)
    } else if (line.startsWith('### ')) {
      closeLists()
      out.push(`<h3>${bold(line.slice(4))}</h3>`)
    } else if (/^- /.test(line) || /^\* /.test(line)) {
      if (inOl) { out.push('</ol>'); inOl = false }
      if (!inUl) { out.push('<ul>'); inUl = true }
      out.push(`<li>${bold(line.replace(/^[-*] /, ''))}</li>`)
    } else if (/^\d+\. /.test(line)) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (!inOl) { out.push('<ol>'); inOl = true }
      out.push(`<li>${bold(line.replace(/^\d+\. /, ''))}</li>`)
    } else if (line.trim() === '') {
      closeLists()
      out.push('<br>')
    } else {
      closeLists()
      out.push(`<p>${bold(line)}</p>`)
    }
  }
  closeLists()
  return out.join('\n')
}

function printReport(countryName: string, reportText: string) {
  const win = window.open('', '_blank')
  if (!win) { window.alert('Please allow pop-ups to print.'); return }

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${countryName} — Business Setup Guide</title>
  <!-- In the print dialog, choose "Save as PDF" as the destination -->
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 780px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; font-size: 14px; }
    h1 { font-size: 22px; border-bottom: 2px solid #1a3a6b; padding-bottom: 10px; margin-bottom: 4px; color: #1a3a6b; }
    .meta { color: #666; font-size: 12px; margin-bottom: 28px; }
    h2 { font-size: 15px; color: #1a3a6b; margin-top: 22px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 13px; margin-top: 14px; margin-bottom: 4px; }
    p { margin: 4px 0 8px; }
    ul, ol { margin: 4px 0 8px 20px; padding: 0; }
    li { margin-bottom: 4px; }
    strong { font-weight: 700; }
    .footer { margin-top: 36px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 11px; color: #888; }
    @media print { body { margin: 20px auto; } }
  </style>
</head>
<body>
  <h1>${countryName} — Business Setup Guide</h1>
  <div class="meta">Generated ${date} &nbsp;|&nbsp; Global Reshoring Intelligence &nbsp;|&nbsp; For internal use only</div>
  ${mdToHtml(reportText)}
  <div class="footer">Data sources: World Bank WGI 2023, B-READY 2025, World Bank Economic Indicators 2023. This report is AI-generated and intended as a starting point for due diligence — not legal or financial advice.</div>
</body>
</html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

export default function CountryReport({ country, businessLinks, onClose, userPrefs }: Props) {
  const [reportText, setReportText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const industry = userPrefs?.industry ?? null
  const cacheKey = `report_v1_${country.code}_${industry ?? 'none'}`

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setReportText(cached)
      setLoading(false)
      return
    }
    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.code])

  async function generate() {
    setLoading(true)
    setError(null)
    setReportText('')

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: { ...country, itar_status: getITARStatus(country.code) },
          businessLinks,
          industry,
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setReportText(full)
      }

      // Only cache successful reports — never cache errors
      if (!full.startsWith('ERROR:')) {
        localStorage.setItem(cacheKey, full)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sections = reportText
    .split(/(?=^## )/m)
    .filter(s => s.trim())

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-base">{country.name} — Business Setup Guide</h2>
            <p className="text-gray-500 text-xs mt-0.5">AI-generated · not legal advice · cache saved locally</p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && reportText && (
              <>
                <button
                  onClick={() => { localStorage.removeItem(cacheKey); generate() }}
                  title="Regenerate"
                  className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => printReport(country.name, reportText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Save as PDF
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Loading state */}
          {loading && !reportText && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Generating report for {country.name}…</p>
              <p className="text-gray-600 text-xs mt-1">This takes about 10 seconds</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
              <p className="font-medium mb-1">Could not generate report</p>
              <p className="text-red-400 text-xs">{error}</p>
              <button onClick={generate} className="mt-3 text-xs text-red-300 underline">Try again</button>
            </div>
          )}

          {/* Streaming / rendered report */}
          {reportText && (
            <div className="space-y-4">
              {sections.map((section, i) => {
                const firstNewline = section.indexOf('\n')
                const header = section.slice(0, firstNewline === -1 ? undefined : firstNewline).replace(/^#+\s*/, '').trim()
                const body = firstNewline === -1 ? '' : section.slice(firstNewline + 1).trim()

                return (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {header}
                    </h3>
                    <div className="text-gray-300 text-sm leading-relaxed space-y-1.5">
                      {body.split('\n').map((line, j) => {
                        const t = line.trim()
                        if (!t) return null
                        const boldify = (s: string) => {
                          const parts = s.split(/\*\*(.+?)\*\*/)
                          return parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi}>{p}</strong> : p)
                        }
                        if (t.startsWith('- ') || t.startsWith('• ')) {
                          return <div key={j} className="flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">•</span><span>{boldify(t.replace(/^[-•] /, ''))}</span></div>
                        }
                        if (/^\d+\. /.test(t)) {
                          const num = t.match(/^(\d+)\. /)?.[1]
                          return <div key={j} className="flex gap-2"><span className="text-blue-500 flex-shrink-0 font-mono text-xs mt-0.5 w-4">{num}.</span><span>{boldify(t.replace(/^\d+\. /, ''))}</span></div>
                        }
                        return <p key={j}>{boldify(t)}</p>
                      })}
                    </div>
                  </div>
                )
              })}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-xs py-2">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Writing…
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800 flex-shrink-0">
          <p className="text-gray-600 text-xs">
            AI-generated from World Bank data. For due diligence starting points only — not legal or financial advice.
            {reportText && !loading && <span className="text-gray-700"> · Cached locally · <button onClick={() => { localStorage.removeItem(cacheKey); generate() }} className="underline hover:text-gray-500">Refresh</button></span>}
          </p>
        </div>

      </div>
    </div>
  )
}

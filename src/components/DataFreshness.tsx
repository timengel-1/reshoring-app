import { useState } from 'react'
import type { DataFreshness } from '../types'

interface DataFreshnessProps {
  freshness: DataFreshness;
}

// How stale is a year relative to now?
function stalenessColor(year: number): string {
  const age = new Date().getFullYear() - year
  if (age === 0) return '#22c55e'   // current year — green
  if (age === 1) return '#84cc16'   // 1 year old — lime
  if (age === 2) return '#eab308'   // 2 years old — yellow
  return '#f97316'                   // 3+ years — orange
}

function stalenessLabel(year: number): string {
  const age = new Date().getFullYear() - year
  if (age === 0) return 'Current'
  if (age === 1) return '1 yr ago'
  if (age === 2) return '2 yrs ago'
  return `${age} yrs ago`
}

export default function DataFreshness({ freshness }: DataFreshnessProps) {
  const [open, setOpen] = useState(false)

  const generatedDate = new Date(freshness.generated_utc)
  const generatedStr = generatedDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
  })

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors border border-gray-800 hover:border-gray-600 rounded-lg px-2.5 py-1.5"
        title="Data freshness information"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Data freshness
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-8 z-50 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Data Sources & Freshness</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 text-lg leading-none">×</button>
            </div>

            <div className="text-gray-500 text-xs mb-4">
              Pipeline last run: <span className="text-gray-400">{generatedStr}</span>
            </div>

            <div className="space-y-3">
              {Object.entries(freshness.sources).map(([key, src]) => (
                <a
                  key={key}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-200 text-xs font-medium group-hover:text-white truncate">
                        {src.label}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {src.coverage} countries covered
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-semibold" style={{ color: stalenessColor(src.year) }}>
                        {src.year}
                      </div>
                      <div className="text-xs" style={{ color: stalenessColor(src.year) }}>
                        {stalenessLabel(src.year)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  Current year
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  1–2 yrs old
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  3+ yrs old
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

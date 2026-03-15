import { useState } from 'react'
import { IndustryCategory, UserPreferences } from '../types'
import { INDUSTRY_TARIFF_MAP } from '../utils/industryTariffMap'

interface Props {
  userPrefs: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

export default function IndustrySelector({ userPrefs, onUpdate }: Props) {
  const [open, setOpen] = useState(false)

  const selected = userPrefs.industry
    ? INDUSTRY_TARIFF_MAP[userPrefs.industry]
    : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          selected
            ? 'bg-indigo-900/60 border-indigo-700 text-indigo-300 hover:bg-indigo-900'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
        }`}
        title="Set your industry to get relevant tariff analysis"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {selected ? selected.label : 'Set Industry'}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <div>
                <h2 className="text-white font-semibold text-sm">Select Your Industry</h2>
                <p className="text-gray-500 text-xs mt-0.5">Filters tariff data to sectors relevant for your business</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {(Object.entries(INDUSTRY_TARIFF_MAP) as [IndustryCategory, typeof INDUSTRY_TARIFF_MAP[IndustryCategory]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { onUpdate({ ...userPrefs, industry: key }); setOpen(false) }}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    selected && userPrefs.industry === key
                      ? 'bg-indigo-900/60 border-indigo-600 text-indigo-200'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-medium">{val.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5 leading-snug">{val.description}</div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => { onUpdate({ ...userPrefs, industry: null }); setOpen(false) }}
                  className="w-full py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  Clear — show all sectors
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

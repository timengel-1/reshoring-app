import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Country, NewsSource, BusinessLinks, UserPreferences, TariffSectors } from '../types'
import { INDUSTRY_TARIFF_MAP, SECTOR_LABELS } from '../utils/industryTariffMap'
import { getScoreColor, getScoreLabel } from './ScoreBar'
import ScoreBreakdownBar, { ScoreBreakdownLegend } from './ScoreBreakdownBar'
import CountryReport from './CountryReport'
import { getITARBadge } from '../utils/itarStatus'
import newsSources from '../data/news_sources.json'
import newsRegional from '../data/news_regional.json'
import businessLinksData from '../data/business_links.json'

interface TradeNewsItem {
  title: string
  url: string
  domain: string
  date: string | null
}

interface CountryProfileProps {
  country: Country;
  onClose: () => void;
  onAddToCompare: (country: Country) => void;
  isInCompare: boolean;
  userPrefs: UserPreferences;
  onUpdatePrefs: (prefs: UserPreferences) => void;
}

// Pre-computed global averages (206 countries with scores)
const GLOBAL_AVG: Record<string, number> = {
  overall:              51.3,
  business_environment: 60.1,
  political_stability:  49.5,
  govt_effectiveness:   49.3,
  regulatory_quality:   49.4,
  rule_of_law:          49.5,
  corruption_control:   49.5,
  bready_entry:         71.7,
  bready_labor:         65.4,
  bready_trade:         59.1,
  bready_tax:           54.1,
  bready_dispute:       52.8,
  bready_competition:   50.2,
  bready_insolvency:    48.2,
  // Trade averages (140 countries)
  tariff_weighted:       5.8,
  tariff_simple:         7.1,
  trade_pct_gdp:        92.2,
  lpi:                   3.0,   // LPI is 1-5 scale
}

function fmt(n: number | null, decimals = 1, suffix = '') {
  if (n === null || n === undefined) return '–'
  return n.toFixed(decimals) + suffix
}

function fmtBig(n: number | null) {
  if (n === null || n === undefined) return '–'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

const TYPE_STYLE: Record<string, string> = {
  financial:  'bg-yellow-900 text-yellow-300',
  business:   'bg-blue-900 text-blue-300',
  general:    'bg-gray-700 text-gray-300',
  government: 'bg-red-900 text-red-300',
}

function getNewsSources(country: Country): NewsSource[] {
  const byCode = (newsSources as Record<string, NewsSource[]>)[country.code]
  if (byCode) return byCode
  const regionMap: Record<string, string> = {
    'Europe & Central Asia': 'Europe & Central Asia',
    'East Asia & Pacific': 'East Asia & Pacific',
    'South Asia': 'South Asia',
    'Latin America & Caribbean': 'Latin America & Caribbean',
    'Middle East & North Africa': 'Middle East & North Africa',
    'Sub-Saharan Africa': 'Sub-Saharan Africa',
    'North America': 'North America',
  }
  const regionKey = regionMap[country.region]
  if (regionKey) return (newsRegional as Record<string, NewsSource[]>)[regionKey] ?? []
  return []
}

function getTariffColor(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '#6b7280'
  if (pct < 5) return '#22c55e'
  if (pct < 15) return '#eab308'
  return '#ef4444'
}

export default function CountryProfile({ country, onClose, onAddToCompare, isInCompare, userPrefs, onUpdatePrefs }: CountryProfileProps) {
  const score = country.overall_score
  const scoreColor = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)

  const [tradeNews, setTradeNews] = useState<TradeNewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAllSectors, setShowAllSectors] = useState(false)

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?country=${country.code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    setTradeNews([])
    setNewsLoading(true)
    fetch(`/api/news?country=${encodeURIComponent(country.name)}`)
      .then(r => r.ok ? r.json() : [])
      .then((items: TradeNewsItem[]) => setTradeNews(items))
      .catch(() => setTradeNews([]))
      .finally(() => setNewsLoading(false))
  }, [country.code])

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col h-full overflow-y-auto">

      {/* Header */}
      {(() => {
        const itar = getITARBadge(country.code)
        return (
          <div className="p-4 border-b border-gray-800 flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-lg font-bold text-white">{country.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-500 text-xs">{country.region}</span>
                <span className="text-gray-700">·</span>
                <span className="text-gray-500 text-xs">{country.income_level}</span>
              </div>
              {/* ITAR / Allied Status Badge */}
              <div className="mt-2">
                <span
                  title={itar.description}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${itar.bgColor} ${itar.textColor} cursor-help`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${itar.dotColor}`} />
                  {itar.label}
                </span>
                {(itar.status === 'caution' || itar.status === 'restricted') && (
                  <p className="text-xs text-gray-600 mt-1 leading-snug">
                    {itar.status === 'restricted'
                      ? 'ITAR restrictions likely apply — legal review required.'
                      : 'Significant export control restrictions — consult legal counsel.'}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none mt-1 flex-shrink-0">×</button>
          </div>
        )
      })()}

      {/* Overall score */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">Overall Viability Score</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: scoreColor + '30', color: scoreColor }}>
            {scoreLabel}
          </span>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-5xl font-bold" style={{ color: scoreColor }}>
            {score !== null ? score.toFixed(1) : '–'}
          </span>
          <div className="mb-1">
            <div className="text-gray-500 text-lg">/100</div>
            {score !== null && (
              <div className="text-xs" style={{ color: score >= GLOBAL_AVG.overall ? '#22c55e' : '#f97316' }}>
                {score >= GLOBAL_AVG.overall ? '▲' : '▼'} {Math.abs(score - GLOBAL_AVG.overall).toFixed(1)} vs global avg ({GLOBAL_AVG.overall})
              </div>
            )}
          </div>
        </div>
        {/* Overall bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-visible">
          {score !== null && (
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, backgroundColor: scoreColor, opacity: 0.9 }}
            />
          )}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white opacity-50 z-10"
            style={{ left: `${GLOBAL_AVG.overall}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-700 text-xs">0</span>
          <span className="text-gray-600 text-xs">| avg {GLOBAL_AVG.overall}</span>
          <span className="text-gray-700 text-xs">100</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Score Breakdown</h3>
        <ScoreBreakdownLegend />
        <ScoreBreakdownBar
          label="Business Environment"
          value={country.scores.business_environment}
          globalAvg={GLOBAL_AVG.business_environment}
          weight="35%"
        />
        <ScoreBreakdownBar
          label="Political Stability"
          value={country.scores.political_stability}
          globalAvg={GLOBAL_AVG.political_stability}
          weight="25%"
        />
        <ScoreBreakdownBar
          label="Rule of Law"
          value={country.scores.rule_of_law}
          globalAvg={GLOBAL_AVG.rule_of_law}
          weight="15%"
        />
        <ScoreBreakdownBar
          label="Corruption Control"
          value={country.scores.corruption_control}
          globalAvg={GLOBAL_AVG.corruption_control}
          weight="15%"
        />
        <ScoreBreakdownBar
          label="Govt Effectiveness"
          value={country.scores.govt_effectiveness}
          globalAvg={GLOBAL_AVG.govt_effectiveness}
          weight="10%"
        />
      </div>

      {/* B-READY pillars */}
      {country.bready.composite !== null && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">B-READY Business Climate (2025)</h3>
          <p className="text-gray-600 text-xs mb-3">World Bank regulatory quality index — 108 economies</p>
          <ScoreBreakdownLegend />
          {country.bready.business_entry !== null && (
            <ScoreBreakdownBar label="Business Entry" value={country.bready.business_entry} globalAvg={GLOBAL_AVG.bready_entry} />
          )}
          {country.bready.labor !== null && (
            <ScoreBreakdownBar label="Labor" value={country.bready.labor} globalAvg={GLOBAL_AVG.bready_labor} />
          )}
          {country.bready.international_trade !== null && (
            <ScoreBreakdownBar label="International Trade" value={country.bready.international_trade} globalAvg={GLOBAL_AVG.bready_trade} />
          )}
          {country.bready.taxation !== null && (
            <ScoreBreakdownBar label="Taxation" value={country.bready.taxation} globalAvg={GLOBAL_AVG.bready_tax} />
          )}
          {country.bready.dispute_resolution !== null && (
            <ScoreBreakdownBar label="Dispute Resolution" value={country.bready.dispute_resolution} globalAvg={GLOBAL_AVG.bready_dispute} />
          )}
          {country.bready.market_competition !== null && (
            <ScoreBreakdownBar label="Market Competition" value={country.bready.market_competition} globalAvg={GLOBAL_AVG.bready_competition} />
          )}
          {country.bready.business_insolvency !== null && (
            <ScoreBreakdownBar label="Business Insolvency" value={country.bready.business_insolvency} globalAvg={GLOBAL_AVG.bready_insolvency} />
          )}
        </div>
      )}

      {/* Economic indicators */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Economic Indicators</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'GDP', value: fmtBig(country.economic.gdp_usd) },
            { label: 'GDP/Capita', value: fmtBig(country.economic.gdp_per_capita) },
            { label: 'GDP Growth', value: fmt(country.economic.gdp_growth_pct, 1, '%') },
            { label: 'Population', value: country.economic.population !== null
                ? (country.economic.population >= 1e6
                    ? (country.economic.population / 1e6).toFixed(1) + 'M'
                    : country.economic.population.toLocaleString())
                : '–' },
            { label: 'FDI (% GDP)', value: fmt(country.economic.fdi_pct_gdp, 1, '%') },
            { label: 'Corp Tax', value: fmt(country.economic.corporate_tax_rate, 1, '%') },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 rounded-lg p-2.5">
              <div className="text-gray-500 text-xs">{label}</div>
              <div className="text-white text-sm font-medium mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Birth Rate Trend */}
      {country.economic.birth_rate !== null && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider">Birth Rate Trend</h3>
            <span className="text-gray-500 text-xs">per 1,000 people · 2000–2024</span>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-2xl font-bold text-white">
              {fmt(country.economic.birth_rate, 1)}
            </span>
            <span className="text-gray-500 text-sm mb-0.5">per 1,000 (latest)</span>
            {country.economic.birth_rate_history.length >= 2 && (() => {
              const first = country.economic.birth_rate_history[0][1]
              const last  = country.economic.birth_rate_history[country.economic.birth_rate_history.length - 1][1]
              const delta = last - first
              return (
                <span className="text-xs mb-0.5" style={{ color: delta < 0 ? '#f97316' : '#22c55e' }}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)} since {country.economic.birth_rate_history[0][0]}
                </span>
              )
            })()}
          </div>
          {country.economic.birth_rate_history.length > 1 && (
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart
                data={country.economic.birth_rate_history.map(([year, value]) => ({ year, value }))}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="birthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(v: number) => [`${v.toFixed(1)} /1k`, 'Birth rate']}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} fill="url(#birthGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Trade & Market Access */}
      {country.trade && (
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Trade & Market Access</h3>
          <p className="text-gray-600 text-xs mb-4">World Bank WITS · LPI 2023 · Tariff data avg 2022</p>

          {/* LPI — full-width featured metric, 1-5 scale */}
          {country.trade.logistics_performance_index !== null && (() => {
            const lpi = country.trade.logistics_performance_index!
            const lpiPct = ((lpi - 1) / 4) * 100
            const avgPct = ((GLOBAL_AVG.lpi - 1) / 4) * 100
            const lpiColor = lpi >= 3.5 ? '#22c55e' : lpi >= 2.8 ? '#eab308' : '#ef4444'
            return (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-300 text-xs font-medium">Logistics Performance Index</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: lpiColor }}>
                    {lpi.toFixed(2)} <span className="text-gray-500 font-normal text-xs">/ 5.0</span>
                  </span>
                </div>
                <div className="relative h-5 bg-gray-800 rounded-md overflow-visible">
                  <div className="absolute left-0 top-0 h-full rounded-md transition-all duration-500"
                    style={{ width: `${lpiPct}%`, backgroundColor: lpiColor, opacity: 0.85 }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white opacity-60 z-10"
                    style={{ left: `${avgPct}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-700 text-xs">1.0 (poor)</span>
                  <span className="text-gray-600 text-xs">| avg {GLOBAL_AVG.lpi.toFixed(1)}</span>
                  <span className="text-gray-700 text-xs">5.0 (best)</span>
                </div>
              </div>
            )
          })()}

          {/* Summary tariff row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              {
                label: 'Applied Tariff',
                sub: 'weighted mean',
                value: country.trade.tariff_rate_weighted_mean,
                avg: GLOBAL_AVG.tariff_weighted,
                suffix: '%',
                goodIfLow: true,
              },
              {
                label: 'Applied Tariff',
                sub: 'simple mean',
                value: country.trade.tariff_rate_simple_mean,
                avg: GLOBAL_AVG.tariff_simple,
                suffix: '%',
                goodIfLow: true,
              },
              {
                label: 'Bound Tariff',
                sub: 'WTO ceiling (simple mean)',
                value: country.trade.tariff_bound_mean,
                avg: null,
                suffix: '%',
                goodIfLow: null,
              },
              {
                label: 'Tariff Overhang',
                sub: 'bound − applied (policy risk)',
                value: country.trade.tariff_overhang,
                avg: null,
                suffix: ' pp',
                goodIfLow: null,
              },
              {
                label: 'Trade Openness',
                sub: '% of GDP',
                value: country.trade.trade_pct_gdp,
                avg: GLOBAL_AVG.trade_pct_gdp,
                suffix: '%',
                goodIfLow: false,
              },
            ].map(item => (
              <div key={item.label + item.sub} className="bg-gray-800 rounded-lg p-2.5">
                <div className="text-gray-500 text-xs">{item.label}</div>
                <div className="text-gray-600 text-xs">{item.sub}</div>
                {item.value !== null && item.value !== undefined ? (
                  <>
                    <div className="text-white text-sm font-semibold mt-1">
                      {item.value.toFixed(1)}{item.suffix}
                    </div>
                    {item.avg !== null && item.goodIfLow !== null ? (
                      <div className="text-xs mt-0.5" style={{
                        color: (item.goodIfLow ? item.value <= item.avg : item.value >= item.avg) ? '#22c55e' : '#f97316'
                      }}>
                        {(item.goodIfLow ? item.value <= item.avg : item.value >= item.avg) ? '▲' : '▼'} vs {item.avg.toFixed(1)} avg
                      </div>
                    ) : item.label === 'Tariff Overhang' ? (
                      <div className="text-xs mt-0.5" style={{ color: item.value > 20 ? '#f97316' : item.value > 10 ? '#eab308' : '#22c55e' }}>
                        {item.value > 20 ? 'High policy risk' : item.value > 10 ? 'Moderate risk' : 'Low risk'}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="text-gray-600 text-sm mt-1">–</div>
                )}
              </div>
            ))}
          </div>

          {/* US Regime Warning */}
          <div className="flex items-start gap-2 bg-yellow-950/40 border border-yellow-900/60 rounded-lg px-3 py-2.5 mb-4">
            <span className="text-yellow-500 text-xs flex-shrink-0 mt-0.5">⚠</span>
            <p className="text-yellow-200/70 text-xs leading-snug">
              US-applied tariff rates reflect 2022 data and may not reflect current policy.{' '}
              <a
                href="https://hts.usitc.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 underline hover:text-yellow-300"
              >
                View current US Harmonized Tariff Schedule →
              </a>
            </p>
          </div>

          {/* Sector Tariff Section */}
          {(() => {
            const sectors = country.trade.tariff_sectors
            const industry = userPrefs.industry
            const industryDef = industry ? INDUSTRY_TARIFF_MAP[industry] : null

            if (industryDef && sectors) {
              // Industry-filtered view: 3 cards
              const renderSectorList = (keys: (keyof TariffSectors)[], useExport = false) => {
                if (useExport) {
                  const xprt = country.trade.export_tariff_weighted_mean
                  return (
                    <div className="space-y-1.5">
                      {keys.map(key => {
                        const val = sectors[key]?.weighted_mean
                        return (
                          <div key={key} className="flex items-center justify-between gap-2">
                            <span className="text-gray-400 text-xs truncate">{SECTOR_LABELS[key]}</span>
                            <span className="text-xs font-medium tabular-nums flex-shrink-0" style={{ color: getTariffColor(val) }}>
                              {val !== null && val !== undefined ? `${val.toFixed(1)}%` : '—'}
                            </span>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-700">
                        <span className="text-gray-400 text-xs">Export tariff</span>
                        <span className="text-xs font-medium tabular-nums flex-shrink-0" style={{ color: getTariffColor(xprt) }}>
                          {xprt !== null && xprt !== undefined ? `${xprt.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                    </div>
                  )
                }
                return (
                  <div className="space-y-1.5">
                    {keys.map(key => {
                      const val = sectors[key]?.weighted_mean
                      return (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-gray-400 text-xs truncate">{SECTOR_LABELS[key]}</span>
                          <span className="text-xs font-medium tabular-nums flex-shrink-0" style={{ color: getTariffColor(val) }}>
                            {val !== null && val !== undefined ? `${val.toFixed(1)}%` : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              }

              return (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-300 text-xs font-medium">Tariff Exposure — {industryDef.label}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">■</span>&lt;5%
                      <span className="text-yellow-500">■</span>5-15%
                      <span className="text-red-500">■</span>&gt;15%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { title: 'Raw Materials', keys: industryDef.raw_materials, useExport: false },
                      { title: 'Key Components', keys: industryDef.components, useExport: false },
                      { title: 'Finished Goods', keys: industryDef.finished_goods, useExport: true },
                    ].map(card => (
                      <div key={card.title} className="bg-gray-800 rounded-lg p-2.5">
                        <div className="text-gray-500 text-xs mb-2 font-medium">{card.title}</div>
                        {renderSectorList(card.keys, card.useExport)}
                      </div>
                    ))}
                  </div>
                  {!showAllSectors && (
                    <button
                      onClick={() => setShowAllSectors(true)}
                      className="mt-2 text-xs text-gray-600 hover:text-gray-400 w-full text-center"
                    >
                      View all sectors ↓
                    </button>
                  )}
                </div>
              )
            }

            // No industry set — CTA + full sector grid
            return (
              <div className="mb-3">
                {!industry && (
                  <button
                    onClick={() => onUpdatePrefs({ ...userPrefs, industry: 'general_manufacturing' })}
                    className="w-full mb-3 px-3 py-2 bg-indigo-900/30 border border-indigo-800/60 rounded-lg text-xs text-indigo-300 hover:bg-indigo-900/50 transition-colors text-left"
                  >
                    Set your industry to see relevant tariff exposure →
                  </button>
                )}
              </div>
            )
          })()}

          {/* All-sectors grid (shown when no industry set, or after "View all" toggle) */}
          {(country.trade.tariff_sectors && (!userPrefs.industry || showAllSectors)) && (() => {
            const sectors = country.trade.tariff_sectors!
            return (
              <div>
                {showAllSectors && (
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider">All Sectors</h4>
                    <button onClick={() => setShowAllSectors(false)} className="text-xs text-gray-600 hover:text-gray-400">
                      Collapse ↑
                    </button>
                  </div>
                )}
                {!userPrefs.industry && (
                  <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Import Tariffs by Sector</h4>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SECTOR_LABELS) as (keyof TariffSectors)[]).map(key => {
                    const val = sectors[key]?.weighted_mean
                    return (
                      <div key={key} className="bg-gray-800 rounded-lg p-2.5">
                        <div className="text-gray-500 text-xs leading-snug">{SECTOR_LABELS[key]}</div>
                        <div className="text-sm font-semibold mt-1" style={{ color: getTariffColor(val) }}>
                          {val !== null && val !== undefined ? `${val.toFixed(1)}%` : '—'}
                        </div>
                        {val === null || val === undefined ? (
                          <div className="text-gray-700 text-xs">No WITS data</div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Export tariff callout */}
          {(() => {
            const xprt = country.trade.export_tariff_weighted_mean
            if (xprt !== null && xprt !== undefined && xprt > 0) {
              return (
                <div className="mt-3 bg-orange-950/30 border border-orange-900/50 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-orange-300 text-xs font-medium">Export Tariff</span>
                    <span className="text-orange-300 text-sm font-bold">{xprt.toFixed(1)}%</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-snug">
                    This country charges {xprt.toFixed(1)}% on exports — common in commodity-exporting nations. Factor into cost-of-goods analysis.
                  </p>
                </div>
              )
            }
            return (
              <p className="text-gray-700 text-xs mt-2">No significant export tariffs reported.</p>
            )
          })()}
        </div>
      )}

      {/* Trade Intelligence — live GDELT headlines */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider">Trade Intelligence</h3>
          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>

        {newsLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-5/6 mb-1.5" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
                <div className="h-2 bg-gray-700 rounded w-1/3 mt-2" />
              </div>
            ))}
          </div>
        )}

        {!newsLoading && tradeNews.length === 0 && (
          <p className="text-gray-600 text-xs">No recent trade news found.</p>
        )}

        {!newsLoading && tradeNews.length > 0 && (
          <div className="space-y-2">
            {tradeNews.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors group"
              >
                <p className="text-gray-200 text-xs font-medium group-hover:text-white leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-gray-500 text-xs truncate">{item.domain}</span>
                  {item.date && (
                    <>
                      <span className="text-gray-700 text-xs">·</span>
                      <span className="text-gray-600 text-xs flex-shrink-0">{item.date}</span>
                    </>
                  )}
                  <svg className="w-3 h-3 text-gray-600 group-hover:text-gray-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* News sources */}
      {(() => {
        const sources = getNewsSources(country)
        const hasDedicated = !!(newsSources as Record<string, NewsSource[]>)[country.code]
        return sources.length > 0 ? (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider">News Sources</h3>
              {!hasDedicated && <span className="text-gray-600 text-xs">Regional</span>}
            </div>
            <div className="space-y-2">
              {sources.map(src => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors group"
                >
                  <span className="text-gray-200 text-xs font-medium group-hover:text-white">{src.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_STYLE[src.type] ?? TYPE_STYLE.general}`}>{src.type}</span>
                    <svg className="w-3 h-3 text-gray-500 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null
      })()}

      {/* Business Setup Resources */}
      {(() => {
        const links = (businessLinksData as Record<string, BusinessLinks>)[country.code]
        if (!links) return null

        const items = [
          links.us_embassy && {
            icon: '🏛️',
            label: 'U.S. Embassy',
            sub: 'Commercial section — help for US businesses',
            ...links.us_embassy,
          },
          links.us_guide && {
            icon: '📋',
            label: links.us_guide.name,
            sub: 'trade.gov Country Commercial Guide',
            ...links.us_guide,
          },
          links.invest_agency && {
            icon: '🏢',
            label: links.invest_agency.name,
            sub: 'Host country invest agency / ministry of commerce',
            ...links.invest_agency,
          },
        ].filter(Boolean) as Array<{ icon: string; label: string; sub: string; url: string | null }>

        if (!items.length) return null

        return (
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Business Setup Resources</h3>
            <div className="space-y-2">
              {items.map(item =>
                item.url ? (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2.5 transition-colors group"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-200 text-xs font-medium group-hover:text-white leading-snug">{item.label}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{item.sub}</div>
                    </div>
                    <svg className="w-3 h-3 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <div key={item.label} className="flex items-start gap-3 bg-gray-800 rounded-lg px-3 py-2.5 opacity-50">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-400 text-xs font-medium leading-snug">{item.label}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{item.sub}</div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )
      })()}

      {/* Actions */}
      <div className="p-4 mt-auto space-y-2">
        <button
          onClick={() => setShowReport(true)}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
        >

          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Business Setup Report
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCompare(country)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              isInCompare
                ? 'bg-gray-700 text-gray-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isInCompare ? 'Added to Compare' : 'Add to Compare'}
          </button>
          <button
            onClick={handleShare}
            title="Copy shareable link"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {showReport && (() => {
        const links = (businessLinksData as Record<string, BusinessLinks>)[country.code] ?? null
        return (
          <CountryReport
            country={country}
            businessLinks={links}
            onClose={() => setShowReport(false)}
            userPrefs={userPrefs}
          />
        )
      })()}
    </div>
  )
}

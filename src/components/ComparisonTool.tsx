import { Country } from '../types'
import { getScoreColor } from './ScoreBar'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ComparisonToolProps {
  compareList: Country[];
  onRemove: (code: string) => void;
  allCountries: Country[];
  onAdd: (c: Country) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

function fmt(n: number | null, suffix = '') {
  if (n === null || n === undefined) return '–'
  return n.toFixed(1) + suffix
}

function fmtBig(n: number | null) {
  if (n === null || n === undefined) return '–'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

export default function ComparisonTool({ compareList, onRemove, allCountries, onAdd }: ComparisonToolProps) {
  const radarData = [
    { subject: 'Biz Env', key: 'business_environment' },
    { subject: 'Pol Stab', key: 'political_stability' },
    { subject: 'Rule of Law', key: 'rule_of_law' },
    { subject: 'Anti-Corr', key: 'corruption_control' },
    { subject: 'Govt Eff', key: 'govt_effectiveness' },
    { subject: 'Reg Quality', key: 'regulatory_quality' },
  ].map(dim => {
    const row: Record<string, string | number> = { subject: dim.subject }
    compareList.forEach(c => {
      row[c.code] = (c.scores[dim.key as keyof typeof c.scores] as number | null) ?? 0
    })
    return row
  })

  const available = allCountries.filter(c => !compareList.find(x => x.code === c.code))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Country Comparison</h2>
          {compareList.length < 4 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Add country:</span>
              <select
                onChange={e => {
                  const c = allCountries.find(x => x.code === e.target.value)
                  if (c) { onAdd(c); e.target.value = '' }
                }}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Select country...</option>
                {available.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">⊕</div>
            <div className="text-lg mb-2">No countries selected</div>
            <div className="text-sm">Click a country on the map or rankings, then use "Add to Compare"</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Country cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {compareList.map((country, i) => (
                <div key={country.code} className="bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ borderTopColor: COLORS[i], borderTopWidth: 3 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold text-sm">{country.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{country.region}</div>
                    </div>
                    <button onClick={() => onRemove(country.code)} className="text-gray-600 hover:text-gray-400 text-lg leading-none">×</button>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-bold" style={{ color: getScoreColor(country.overall_score) }}>
                      {country.overall_score?.toFixed(1) ?? '–'}
                    </div>
                    <div className="text-gray-500 text-xs">Overall Score</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar chart */}
            {compareList.length >= 2 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Governance Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    {compareList.map((c, i) => (
                      <Radar key={c.code} name={c.name} dataKey={c.code} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
                    ))}
                    <Tooltip
                      contentStyle={{ background: '#1e2535', border: '1px solid #374151', borderRadius: '6px', color: '#f9fafb' }}
                      formatter={(val: number) => [val.toFixed(1), '']}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Comparison table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider p-4 pb-0">Detailed Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 font-normal px-4 py-3 text-xs">Metric</th>
                      {compareList.map((c, i) => (
                        <th key={c.code} className="text-left font-semibold px-4 py-3 text-xs" style={{ color: COLORS[i] }}>{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Overall Score', get: (c: Country) => fmt(c.overall_score) },
                      { label: 'Business Environment', get: (c: Country) => fmt(c.scores.business_environment) },
                      { label: 'Political Stability', get: (c: Country) => fmt(c.scores.political_stability) },
                      { label: 'Rule of Law', get: (c: Country) => fmt(c.scores.rule_of_law) },
                      { label: 'Corruption Control', get: (c: Country) => fmt(c.scores.corruption_control) },
                      { label: 'Govt Effectiveness', get: (c: Country) => fmt(c.scores.govt_effectiveness) },
                      { label: '──────', get: () => '' },
                      { label: 'GDP', get: (c: Country) => fmtBig(c.economic.gdp_usd) },
                      { label: 'GDP Growth', get: (c: Country) => fmt(c.economic.gdp_growth_pct, '%') },
                      { label: 'GDP/Capita', get: (c: Country) => fmtBig(c.economic.gdp_per_capita) },
                      { label: 'Corporate Tax', get: (c: Country) => fmt(c.economic.corporate_tax_rate, '%') },
                      { label: 'FDI (% GDP)', get: (c: Country) => fmt(c.economic.fdi_pct_gdp, '%') },
                      { label: 'Population', get: (c: Country) => c.economic.population !== null ? (c.economic.population >= 1e6 ? (c.economic.population / 1e6).toFixed(1) + 'M' : String(c.economic.population)) : '–' },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-gray-800 ${row.label.startsWith('─') ? 'opacity-20' : 'hover:bg-gray-800'}`}>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{row.label}</td>
                        {compareList.map(c => (
                          <td key={c.code} className="px-4 py-2.5 text-white text-xs font-medium">
                            {row.get(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

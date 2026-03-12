import { Country, ScoreCategory } from '../types'
import { getScoreColor, getScoreLabel } from './ScoreBar'

interface RankingsTableProps {
  countries: Country[];
  scoreCategory: ScoreCategory;
  onSelectCountry: (c: Country) => void;
  selectedCountry: Country | null;
}

const SCORE_LABELS: Record<ScoreCategory, string> = {
  overall: 'Overall',
  business_environment: 'Business Env',
  political_stability: 'Pol. Stability',
  rule_of_law: 'Rule of Law',
  corruption_control: 'Anti-Corruption',
  govt_effectiveness: 'Govt Effect.',
}

export default function RankingsTable({ countries, scoreCategory, onSelectCountry, selectedCountry }: RankingsTableProps) {
  function getScore(c: Country): number | null {
    if (scoreCategory === 'overall') return c.overall_score
    return c.scores[scoreCategory as keyof typeof c.scores] as number | null
  }

  const sorted = [...countries]
    .filter(c => getScore(c) !== null)
    .sort((a, b) => (getScore(b) ?? 0) - (getScore(a) ?? 0))

  const noScore = countries.filter(c => getScore(c) === null)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Country Rankings</h2>
          <span className="text-gray-500 text-sm">{sorted.length} countries ranked by {SCORE_LABELS[scoreCategory]}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Country</div>
            <div className="col-span-2">{SCORE_LABELS[scoreCategory]}</div>
            <div className="col-span-2">Overall</div>
            <div className="col-span-2">Region</div>
            <div className="col-span-1">Income</div>
          </div>

          {/* Rows */}
          {sorted.map((country, idx) => {
            const score = getScore(country)
            const overallScore = country.overall_score
            const color = getScoreColor(score)
            const isSelected = selectedCountry?.code === country.code

            return (
              <div
                key={country.code}
                onClick={() => onSelectCountry(country)}
                className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-800 cursor-pointer transition-colors hover:bg-gray-800 ${isSelected ? 'bg-blue-900 bg-opacity-30 border-blue-800' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-1 text-gray-500 text-sm">{idx + 1}</div>

                {/* Country */}
                <div className="col-span-4 flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{country.name}</span>
                  <span className="text-gray-600 text-xs">{country.code}</span>
                </div>

                {/* Score */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color }}>{score?.toFixed(1)}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '25', color }}>
                    {getScoreLabel(score)}
                  </span>
                </div>

                {/* Overall */}
                <div className="col-span-2">
                  <span className="text-gray-400 text-sm">{overallScore?.toFixed(1) ?? '–'}</span>
                </div>

                {/* Region */}
                <div className="col-span-2">
                  <span className="text-gray-500 text-xs">{country.region?.replace(' & ', ' & ')}</span>
                </div>

                {/* Income */}
                <div className="col-span-1">
                  <span className="text-gray-600 text-xs">{country.income_level?.split(' ')[0]}</span>
                </div>
              </div>
            )
          })}

          {noScore.length > 0 && (
            <div className="px-4 py-2 text-gray-600 text-xs">
              + {noScore.length} countries with insufficient data not shown
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

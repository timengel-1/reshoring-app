import { Country, FilterState } from '../types'

interface FilterPanelProps {
  countries: Country[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  filteredCount: number;
}

export default function FilterPanel({ countries, filters, setFilters, filteredCount }: FilterPanelProps) {
  const regions = [...new Set(countries.map(c => c.region).filter(Boolean))].sort()
  const incomeLevels = [...new Set(countries.map(c => c.income_level).filter(Boolean))].sort()

  return (
    <div className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Filters</h2>
        <div className="text-gray-500 text-xs mb-4">{filteredCount} countries shown</div>
      </div>

      {/* Region filter */}
      <div>
        <label className="text-gray-400 text-xs block mb-1.5">Region</label>
        <select
          value={filters.region}
          onChange={e => setFilters({ ...filters, region: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Income level filter */}
      <div>
        <label className="text-gray-400 text-xs block mb-1.5">Income Level</label>
        <select
          value={filters.incomeLevel}
          onChange={e => setFilters({ ...filters, incomeLevel: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Levels</option>
          {incomeLevels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Min score */}
      <div>
        <label className="text-gray-400 text-xs block mb-1.5">
          Min Score: <span className="text-blue-400">{filters.minScore}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={e => setFilters({ ...filters, minScore: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Reset */}
      <button
        onClick={() => setFilters({ region: '', incomeLevel: '', minScore: 0, maxScore: 100, sortBy: 'overall' })}
        className="mt-auto text-gray-500 hover:text-gray-300 text-xs border border-gray-700 hover:border-gray-500 rounded-lg py-1.5 transition-colors"
      >
        Reset Filters
      </button>

      {/* Legend */}
      <div className="border-t border-gray-800 pt-4">
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Score Legend</div>
        {[
          { label: 'Strong (75+)', color: '#22c55e' },
          { label: 'Good (60–74)', color: '#84cc16' },
          { label: 'Moderate (45–59)', color: '#eab308' },
          { label: 'Weak (30–44)', color: '#f97316' },
          { label: 'Poor (<30)', color: '#ef4444' },
          { label: 'No data', color: '#4B5563' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-500 text-xs">{label}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Cities (zoom 3+)</div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0 border-2" style={{ backgroundColor: '#FEF3C7', borderColor: '#FBBF24' }} />
            <span className="text-gray-500 text-xs">Capital city</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border-2" style={{ backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }} />
            <span className="text-gray-500 text-xs">Major city (zoom 5+)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

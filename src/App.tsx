import { useState, useMemo } from 'react'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import WorldMap from './components/WorldMap'
import CountryProfile from './components/CountryProfile'
import RankingsTable from './components/RankingsTable'
import ComparisonTool from './components/ComparisonTool'
import { Country, FilterState, ScoreCategory, DataFreshness } from './types'
import countriesData from './data/countries.json'
import freshnessData from './data/data_freshness.json'

const allCountries = countriesData as unknown as Country[]
const freshness = freshnessData as unknown as DataFreshness

export default function App() {
  const [activeView, setActiveView] = useState<'map' | 'rankings' | 'compare'>('map')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [compareList, setCompareList] = useState<Country[]>([])
  const [scoreCategory, setScoreCategory] = useState<ScoreCategory>('overall')
  const [filters, setFilters] = useState<FilterState>({
    region: '',
    incomeLevel: '',
    minScore: 0,
    maxScore: 100,
    sortBy: 'overall',
  })

  function getScore(c: Country): number | null {
    if (scoreCategory === 'overall') return c.overall_score
    return c.scores[scoreCategory as keyof typeof c.scores] as number | null
  }

  const filteredCountries = useMemo(() => {
    return allCountries.filter(c => {
      if (filters.region && c.region !== filters.region) return false
      if (filters.incomeLevel && c.income_level !== filters.incomeLevel) return false
      const score = getScore(c)
      if (score !== null && score < filters.minScore) return false
      return true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, scoreCategory])

  function handleSelectCountry(c: Country | null) {
    setSelectedCountry(c)
  }

  function handleAddToCompare(c: Country) {
    if (compareList.length >= 4) return
    if (!compareList.find(x => x.code === c.code)) {
      setCompareList([...compareList, c])
    }
    setActiveView('compare')
  }

  function handleRemoveFromCompare(code: string) {
    setCompareList(compareList.filter(c => c.code !== code))
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        scoreCategory={scoreCategory}
        setScoreCategory={setScoreCategory}
        freshness={freshness}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Filter sidebar */}
        <FilterPanel
          countries={allCountries}
          filters={filters}
          setFilters={setFilters}
          filteredCount={filteredCountries.length}
        />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {activeView === 'map' && (
            <WorldMap
              countries={allCountries}
              filteredCountries={filteredCountries}
              scoreCategory={scoreCategory}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          )}

          {activeView === 'rankings' && (
            <RankingsTable
              countries={filteredCountries}
              scoreCategory={scoreCategory}
              onSelectCountry={c => { handleSelectCountry(c); setActiveView('map') }}
              selectedCountry={selectedCountry}
            />
          )}

          {activeView === 'compare' && (
            <ComparisonTool
              compareList={compareList}
              onRemove={handleRemoveFromCompare}
              allCountries={allCountries}
              onAdd={handleAddToCompare}
            />
          )}

          {/* Country profile panel */}
          {selectedCountry && activeView === 'map' && (
            <CountryProfile
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
              onAddToCompare={handleAddToCompare}
              isInCompare={!!compareList.find(c => c.code === selectedCountry.code)}
            />
          )}
        </div>
      </div>

      {/* Compare badge */}
      {compareList.length > 0 && activeView !== 'compare' && (
        <button
          onClick={() => setActiveView('compare')}
          className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span className="w-5 h-5 bg-white text-blue-600 rounded-full text-xs font-bold flex items-center justify-center">
            {compareList.length}
          </span>
          View Comparison
        </button>
      )}
    </div>
  )
}

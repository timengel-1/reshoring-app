import { ScoreCategory, DataFreshness, UserPreferences } from '../types'
import DataFreshnessWidget from './DataFreshness'
import IndustrySelector from './IndustrySelector'

interface HeaderProps {
  activeView: 'map' | 'rankings' | 'compare' | 'about';
  setActiveView: (v: 'map' | 'rankings' | 'compare' | 'about') => void;
  scoreCategory: ScoreCategory;
  setScoreCategory: (c: ScoreCategory) => void;
  freshness: DataFreshness | null;
  userPrefs: UserPreferences;
  onUpdatePrefs: (prefs: UserPreferences) => void;
}

const SCORE_LABELS: Record<ScoreCategory, string> = {
  overall: 'Overall Viability',
  business_environment: 'Business Environment',
  political_stability: 'Political Stability',
  rule_of_law: 'Rule of Law',
  corruption_control: 'Corruption Control',
  govt_effectiveness: 'Govt Effectiveness',
}

export default function Header({ activeView, setActiveView, scoreCategory, setScoreCategory, freshness, userPrefs, onUpdatePrefs }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6 flex-wrap">
      <div className="flex items-center gap-3 mr-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Global Reshoring Intelligence</div>
          <div className="text-gray-500 text-xs">Country Viability Platform</div>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
        {(['map', 'rankings', 'compare', 'about'] as const).map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeView === view
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {view === 'map' ? 'World Map' : view === 'rankings' ? 'Rankings' : view === 'compare' ? 'Compare' : 'About & Sources'}
          </button>
        ))}
      </div>

      {/* Industry selector */}
      <IndustrySelector userPrefs={userPrefs} onUpdate={onUpdatePrefs} />

      {/* Score selector */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-gray-500 text-xs">Score:</span>
        <select
          value={scoreCategory}
          onChange={e => setScoreCategory(e.target.value as ScoreCategory)}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          {Object.entries(SCORE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Data freshness widget */}
      {freshness && <DataFreshnessWidget freshness={freshness} />}
    </header>
  )
}

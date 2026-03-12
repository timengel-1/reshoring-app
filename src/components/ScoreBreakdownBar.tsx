import { getScoreColor } from './ScoreBar'

interface ScoreBreakdownBarProps {
  label: string;
  value: number | null;
  globalAvg: number;
  weight?: string; // e.g. "35%" — shown as a subtle annotation
}

export default function ScoreBreakdownBar({ label, value, globalAvg, weight }: ScoreBreakdownBarProps) {
  const hasValue = value !== null && value !== undefined
  const color = getScoreColor(value)
  const pct = hasValue ? Math.min(value!, 100) : 0
  const avgPct = Math.min(globalAvg, 100)
  const aboveAvg = hasValue && value! >= globalAvg

  // Readable verdict label
  const verdict = !hasValue
    ? null
    : value! >= 75 ? 'Strong'
    : value! >= 60 ? 'Good'
    : value! >= 45 ? 'Moderate'
    : value! >= 30 ? 'Weak'
    : 'Poor'

  return (
    <div className="mb-4 last:mb-0">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300 text-xs font-medium">{label}</span>
          {weight && <span className="text-gray-600 text-xs">({weight})</span>}
        </div>
        <div className="flex items-center gap-2">
          {verdict && (
            <span className="text-xs font-medium" style={{ color }}>
              {verdict}
            </span>
          )}
          <span className="text-sm font-bold tabular-nums" style={{ color: hasValue ? color : '#6B7280' }}>
            {hasValue ? value!.toFixed(1) : '–'}
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div className="relative h-5 bg-gray-800 rounded-md overflow-visible">
        {/* Fill */}
        {hasValue && (
          <div
            className="absolute left-0 top-0 h-full rounded-md transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.85 }}
          />
        )}

        {/* No-data pattern */}
        {!hasValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-600 text-xs">No data</span>
          </div>
        )}

        {/* Global average tick */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white opacity-60 z-10"
          style={{ left: `${avgPct}%` }}
        />

        {/* Score label inside bar (only if bar is wide enough) */}
        {hasValue && pct > 15 && (
          <div
            className="absolute top-0 bottom-0 flex items-center pl-2 pointer-events-none"
            style={{ width: `${pct}%` }}
          >
          </div>
        )}
      </div>

      {/* Below-bar context */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-xs">0</span>
        </div>
        <div className="flex items-center gap-3">
          {hasValue && (
            <span
              className="text-xs"
              style={{ color: aboveAvg ? '#22c55e' : '#f97316' }}
            >
              {aboveAvg ? '▲' : '▼'} {Math.abs(value! - globalAvg).toFixed(1)} vs avg
            </span>
          )}
          <span className="text-gray-600 text-xs">100</span>
        </div>
      </div>
    </div>
  )
}

export function ScoreBreakdownLegend() {
  return (
    <div className="flex items-center gap-4 mb-4 px-1">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-85" />
        <span className="text-gray-500 text-xs">Country score</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-0.5 h-3 bg-white opacity-60" />
        <span className="text-gray-500 text-xs">Global avg</span>
      </div>
    </div>
  )
}

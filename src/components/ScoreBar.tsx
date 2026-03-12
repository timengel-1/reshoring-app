interface ScoreBarProps {
  label: string;
  value: number | null;
  max?: number;
  color?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function getScoreColor(score: number | null): string {
  if (score === null) return '#6B7280'
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 45) return '#eab308'
  if (score >= 30) return '#f97316'
  return '#ef4444'
}

export function getScoreLabel(score: number | null): string {
  if (score === null) return 'No data'
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Moderate'
  if (score >= 30) return 'Weak'
  return 'Poor'
}

export default function ScoreBar({ label, value, max = 100, color, showValue = true, size = 'md' }: ScoreBarProps) {
  const pct = value !== null ? (value / max) * 100 : 0
  const barColor = color ?? getScoreColor(value)
  const barH = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>
        {showValue && (
          <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: barColor }}>
            {value !== null ? value.toFixed(1) : '–'}
          </span>
        )}
      </div>
      <div className={`w-full ${barH} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${barH} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}

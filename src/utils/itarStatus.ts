import itarData from '../data/itar_status.json'
import type { ITARStatus } from '../types'

interface ITARCategory {
  label: string
  description: string
  countries: string[]
}

const categories = itarData as Record<string, ITARCategory | string>

// Build a lookup map: ISO3 code → status
const statusMap: Record<string, ITARStatus> = {}
for (const [key, val] of Object.entries(categories)) {
  if (key.startsWith('_')) continue
  const cat = val as ITARCategory
  for (const code of cat.countries) {
    statusMap[code] = key as ITARStatus
  }
}

export function getITARStatus(countryCode: string): ITARStatus {
  return statusMap[countryCode] ?? 'neutral'
}

export interface ITARBadgeInfo {
  status: ITARStatus
  label: string
  description: string
  bgColor: string
  textColor: string
  dotColor: string
}

export function getITARBadge(countryCode: string): ITARBadgeInfo {
  const status = getITARStatus(countryCode)
  const cat = (categories[status] ?? {}) as ITARCategory

  const styles: Record<ITARStatus, { bgColor: string; textColor: string; dotColor: string }> = {
    five_eyes: { bgColor: 'bg-blue-900/60',   textColor: 'text-blue-300',   dotColor: 'bg-blue-400' },
    nato:      { bgColor: 'bg-green-900/60',  textColor: 'text-green-300',  dotColor: 'bg-green-400' },
    ally:      { bgColor: 'bg-teal-900/60',   textColor: 'text-teal-300',   dotColor: 'bg-teal-400' },
    neutral:   { bgColor: 'bg-gray-800/60',   textColor: 'text-gray-400',   dotColor: 'bg-gray-500' },
    caution:   { bgColor: 'bg-orange-900/60', textColor: 'text-orange-300', dotColor: 'bg-orange-400' },
    restricted:{ bgColor: 'bg-red-900/60',    textColor: 'text-red-300',    dotColor: 'bg-red-500' },
  }

  return {
    status,
    label: cat.label ?? 'Neutral',
    description: cat.description ?? 'No special US defense designation.',
    ...styles[status],
  }
}

export const ALL_ITAR_STATUSES: { value: ITARStatus | ''; label: string }[] = [
  { value: '',           label: 'All Countries' },
  { value: 'five_eyes', label: '🔵 Five Eyes' },
  { value: 'nato',      label: '🟢 NATO Ally' },
  { value: 'ally',      label: '🟡 US Treaty Ally' },
  { value: 'neutral',   label: '⚪ Neutral' },
  { value: 'caution',   label: '🟠 Caution' },
  { value: 'restricted',label: '🔴 Restricted / ITAR' },
]

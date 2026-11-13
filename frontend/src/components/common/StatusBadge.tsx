import type { RiskLevel } from '../../types/architecture'

export function StatusBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    low: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
    medium: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
    high: 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
    critical: 'bg-red-500/10 text-red-300 ring-red-500/25',
  }
  return <span className={`rounded-full px-2.5 py-1 font-mono-ui text-xs font-semibold capitalize ring-1 ${styles[level]}`}>{level} risk</span>
}

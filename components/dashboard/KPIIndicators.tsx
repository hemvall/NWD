'use client'

import { useMemo } from 'react'
import { Gauge, Clock, TrendingUp, Activity } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { NetWorthSnapshot, Goal } from '@/lib/types'

interface Props {
  snapshots: NetWorthSnapshot[]
  goal: Goal | null
  isLoading: boolean
}

function computeAnnualizedGrowth(snapshots: NetWorthSnapshot[]): number | null {
  if (snapshots.length < 2) return null
  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  if (first.net_worth <= 0) return null
  const startDate = new Date(first.snapshot_date)
  const endDate = new Date(last.snapshot_date)
  const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 3600 * 1000)
  if (years < 1 / 12) return null
  const ratio = last.net_worth / first.net_worth
  if (ratio <= 0) return null
  return (Math.pow(ratio, 1 / years) - 1) * 100
}

function computeVolatility(snapshots: NetWorthSnapshot[]): number | null {
  if (snapshots.length < 3) return null
  const monthlyReturns: number[] = []
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i - 1].net_worth === 0) continue
    monthlyReturns.push(
      (snapshots[i].net_worth - snapshots[i - 1].net_worth) / Math.abs(snapshots[i - 1].net_worth)
    )
  }
  if (monthlyReturns.length < 2) return null
  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length
  const variance = monthlyReturns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (monthlyReturns.length - 1)
  return Math.sqrt(variance * 12) * 100
}

function computeTimeToGoal(
  snapshots: NetWorthSnapshot[],
  goal: Goal | null
): number | null {
  if (!goal || snapshots.length < 2) return null
  const currentNW = snapshots[snapshots.length - 1].net_worth
  if (currentNW >= goal.target_net_worth) return 0
  const deltas: number[] = []
  for (let i = 1; i < snapshots.length; i++) {
    deltas.push(snapshots[i].net_worth - snapshots[i - 1].net_worth)
  }
  const avgMonthly = deltas.reduce((a, b) => a + b, 0) / deltas.length
  if (avgMonthly <= 0) return null
  const remaining = goal.target_net_worth - currentNW
  return remaining / avgMonthly
}

interface KPICardProps {
  label: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  neonClass: string
  glowColor: string
}

function KPICard({ label, value, subtitle, icon: Icon, neonClass, glowColor }: KPICardProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ background: glowColor }}>
          <Icon className={`h-3.5 w-3.5 ${neonClass}`} />
        </div>
        <span className="text-xs text-white/40 font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold font-mono ${neonClass}`}>{value}</p>
      {subtitle && (
        <p className="text-[10px] text-white/25 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

export default function KPIIndicators({ snapshots, goal, isLoading }: Props) {
  const annualizedGrowth = useMemo(() => computeAnnualizedGrowth(snapshots), [snapshots])
  const volatility = useMemo(() => computeVolatility(snapshots), [snapshots])
  const timeToGoal = useMemo(() => computeTimeToGoal(snapshots, goal), [snapshots, goal])

  const avgMonthlySavings = useMemo(() => {
    if (snapshots.length < 2) return null
    const deltas: number[] = []
    for (let i = 1; i < snapshots.length; i++) {
      deltas.push(snapshots[i].net_worth - snapshots[i - 1].net_worth)
    }
    return deltas.reduce((a, b) => a + b, 0) / deltas.length
  }, [snapshots])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-3 w-16 bg-white/10 rounded mb-3" />
            <div className="h-6 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const formatMonths = (months: number | null): string => {
    if (months === null) return '--'
    if (months === 0) return 'Atteint !'
    const y = Math.floor(months / 12)
    const m = Math.round(months % 12)
    if (y === 0) return `${m} mois`
    if (m === 0) return `${y} an${y > 1 ? 's' : ''}`
    return `${y}a ${m}m`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard
        label="Croissance annualisee"
        value={annualizedGrowth !== null ? formatPercent(annualizedGrowth) : '--'}
        subtitle={annualizedGrowth !== null ? 'Taux compose (CAGR)' : 'Donnees insuffisantes'}
        icon={TrendingUp}
        neonClass={annualizedGrowth !== null && annualizedGrowth >= 0 ? 'neon-text-green' : 'neon-text-pink'}
        glowColor={annualizedGrowth !== null && annualizedGrowth >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(244,114,182,0.15)'}
      />
      <KPICard
        label="Temps vers objectif"
        value={goal ? formatMonths(timeToGoal) : '--'}
        subtitle={goal ? `Objectif : ${formatCurrency(goal.target_net_worth, true)}` : 'Aucun objectif'}
        icon={Clock}
        neonClass="neon-text-cyan"
        glowColor="rgba(34,211,238,0.15)"
      />
      <KPICard
        label="Volatilite"
        value={volatility !== null ? `${volatility.toFixed(1)}%` : '--'}
        subtitle={volatility !== null ? 'Annualisee (ecart-type)' : 'Donnees insuffisantes'}
        icon={Activity}
        neonClass="neon-text-purple"
        glowColor="rgba(167,139,250,0.15)"
      />
      <KPICard
        label="Epargne moy./mois"
        value={avgMonthlySavings !== null ? formatCurrency(avgMonthlySavings) : '--'}
        subtitle={avgMonthlySavings !== null ? `~ ${formatCurrency(avgMonthlySavings * 12, true)}/an` : 'Donnees insuffisantes'}
        icon={Gauge}
        neonClass={avgMonthlySavings !== null && avgMonthlySavings >= 0 ? 'neon-text-green' : 'neon-text-pink'}
        glowColor={avgMonthlySavings !== null && avgMonthlySavings >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(244,114,182,0.15)'}
      />
    </div>
  )
}

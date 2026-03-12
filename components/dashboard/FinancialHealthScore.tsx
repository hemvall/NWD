'use client'

import { useMemo } from 'react'
import type { NetWorthSnapshot, AssetDetails } from '@/lib/types'

interface Props {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  snapshots: NetWorthSnapshot[]
  assetDetails?: AssetDetails | null
  isLoading: boolean
}

interface SubScore {
  label: string
  score: number // 0-100
  detail: string
  color: string
}

function computeDiversification(details: AssetDetails | null | undefined): SubScore {
  if (!details) return { label: 'Diversification', score: 0, detail: 'Pas de donnees', color: '#ef4444' }

  const values = [
    details.immobilier, details.cto, details.livrets, details.cryptos,
    details.voiture, details.montres, details.cartesPokemon,
    details.jeuxPokemon, details.autres,
  ].filter(v => v > 0)

  if (values.length === 0) return { label: 'Diversification', score: 0, detail: '0 classes', color: '#ef4444' }

  const total = values.reduce((a, b) => a + b, 0)
  // Herfindahl-Hirschman Index (lower = more diversified)
  const hhi = values.reduce((sum, v) => sum + (v / total) ** 2, 0)
  // Normalized: 1/n = perfect diversification, 1 = single asset
  const n = values.length
  const minHHI = 1 / n
  const normalizedScore = n > 1 ? Math.round(((1 - hhi) / (1 - minHHI)) * 100) : 10

  let color = '#ef4444'
  if (normalizedScore >= 70) color = '#34d399'
  else if (normalizedScore >= 40) color = '#fbbf24'

  return {
    label: 'Diversification',
    score: Math.min(100, normalizedScore),
    detail: `${n} classe${n > 1 ? 's' : ''} d'actifs`,
    color,
  }
}

function computeDebtRatio(totalAssets: number, totalLiabilities: number): SubScore {
  if (totalAssets === 0 && totalLiabilities === 0) {
    return { label: 'Endettement', score: 100, detail: 'Aucune dette', color: '#34d399' }
  }
  const ratio = totalAssets > 0 ? totalLiabilities / totalAssets : 1
  // 0% debt = 100 score, 100% debt = 0 score
  const score = Math.max(0, Math.round((1 - ratio) * 100))

  let color = '#ef4444'
  if (score >= 70) color = '#34d399'
  else if (score >= 40) color = '#fbbf24'

  return {
    label: 'Endettement',
    score,
    detail: `Ratio: ${(ratio * 100).toFixed(0)}%`,
    color,
  }
}

function computeSavingsConsistency(snapshots: NetWorthSnapshot[]): SubScore {
  if (snapshots.length < 3) {
    return { label: 'Epargne', score: 50, detail: 'Donnees insuffisantes', color: '#fbbf24' }
  }

  let positiveMonths = 0
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].net_worth > snapshots[i - 1].net_worth) positiveMonths++
  }
  const consistency = positiveMonths / (snapshots.length - 1)
  const score = Math.round(consistency * 100)

  let color = '#ef4444'
  if (score >= 70) color = '#34d399'
  else if (score >= 40) color = '#fbbf24'

  return {
    label: 'Epargne',
    score,
    detail: `${positiveMonths}/${snapshots.length - 1} mois positifs`,
    color,
  }
}

function computeGrowthMomentum(snapshots: NetWorthSnapshot[]): SubScore {
  if (snapshots.length < 4) {
    return { label: 'Momentum', score: 50, detail: 'Donnees insuffisantes', color: '#fbbf24' }
  }

  // Compare last 3 months average growth vs overall average
  const allDeltas: number[] = []
  for (let i = 1; i < snapshots.length; i++) {
    allDeltas.push(snapshots[i].net_worth - snapshots[i - 1].net_worth)
  }
  const overallAvg = allDeltas.reduce((a, b) => a + b, 0) / allDeltas.length
  const recent = allDeltas.slice(-3)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length

  // Momentum: is recent growth accelerating?
  let score = 50
  if (overallAvg > 0) {
    const ratio = recentAvg / overallAvg
    score = Math.min(100, Math.max(0, Math.round(ratio * 50)))
  } else if (recentAvg > 0) {
    score = 75
  }

  let color = '#ef4444'
  if (score >= 70) color = '#34d399'
  else if (score >= 40) color = '#fbbf24'

  return {
    label: 'Momentum',
    score,
    detail: recentAvg >= 0 ? 'Tendance positive' : 'Tendance negative',
    color,
  }
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let gradient = 'url(#scoreGradientBad)'
  if (score >= 70) gradient = 'url(#scoreGradientGood)'
  else if (score >= 40) gradient = 'url(#scoreGradientOk)'

  let label = 'Critique'
  let labelColor = 'text-red-400'
  if (score >= 80) { label = 'Excellent'; labelColor = 'neon-text-green' }
  else if (score >= 60) { label = 'Bon'; labelColor = 'neon-text-cyan' }
  else if (score >= 40) { label = 'Moyen'; labelColor = 'text-amber-400' }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="scoreGradientGood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="scoreGradientOk" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="scoreGradientBad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-score-ring"
          style={{
            '--score-offset': offset,
            filter: `drop-shadow(0 0 6px ${score >= 70 ? 'rgba(52,211,153,0.4)' : score >= 40 ? 'rgba(251,191,36,0.4)' : 'rgba(239,68,68,0.4)'})`,
          } as React.CSSProperties}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-bold font-mono text-white">{score}</span>
        <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
      </div>
    </div>
  )
}

export default function FinancialHealthScore({
  netWorth,
  totalAssets,
  totalLiabilities,
  snapshots,
  assetDetails,
  isLoading,
}: Props) {
  const subScores = useMemo((): SubScore[] => [
    computeDiversification(assetDetails),
    computeDebtRatio(totalAssets, totalLiabilities),
    computeSavingsConsistency(snapshots),
    computeGrowthMomentum(snapshots),
  ], [assetDetails, totalAssets, totalLiabilities, snapshots])

  const overallScore = useMemo(() => {
    const weights = [0.25, 0.30, 0.25, 0.20]
    return Math.round(subScores.reduce((sum, s, i) => sum + s.score * weights[i], 0))
  }, [subScores])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 animate-pulse">
        <div className="w-28 h-28 rounded-full bg-white/5" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Score ring */}
      <div className="relative shrink-0">
        <ScoreRing score={overallScore} />
      </div>

      {/* Sub-scores */}
      <div className="flex-1 w-full space-y-3">
        {subScores.map((sub) => (
          <div key={sub.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/60">{sub.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30">{sub.detail}</span>
                <span className="text-xs font-bold font-mono" style={{ color: sub.color }}>
                  {sub.score}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${sub.score}%`,
                  background: `linear-gradient(90deg, ${sub.color}, ${sub.color}88)`,
                  boxShadow: `0 0 8px ${sub.color}40`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { getRank } from '@/lib/system'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import type { NetWorthSnapshot } from '@/lib/types'

interface Props {
  netWorth: number
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

export default function NetWorthCard({ netWorth, snapshots, isLoading }: Props) {
  const lastMonthSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const change = lastMonthSnapshot ? netWorth - lastMonthSnapshot.net_worth : 0
  const changePercent = lastMonthSnapshot && lastMonthSnapshot.net_worth !== 0
    ? (change / Math.abs(lastMonthSnapshot.net_worth)) * 100
    : 0

  const isPositive = change > 0
  const isNegative = change < 0
  const { current: rank, next: nextRank, progress: rankProgress } = getRank(netWorth)

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 w-32 bg-cyan-400/10 rounded mb-4" />
        <div className="h-10 w-48 bg-cyan-400/10 rounded mb-2" />
        <div className="h-4 w-32 bg-cyan-400/5 rounded" />
      </div>
    )
  }

  return (
    <div className="glass-card relative overflow-hidden p-6">
      {/* Scanning highlight sweep */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-400/12 to-transparent animate-[system-scan_6s_linear_infinite]" />

      {/* Ambient glow */}
      <div className="absolute -top-24 -right-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-24 -left-16 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10">
        {/* Window header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-sm">⟦</span>
            <p className="text-cyan-300/70 text-[10px] font-mono font-medium uppercase tracking-[0.3em]">
              Statut · Patrimoine Net
            </p>
            <span className="text-cyan-400 text-sm">⟧</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-cyan-200/50 border border-cyan-400/25 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            En ligne
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <AnimatedNumber
              value={netWorth}
              format={n => formatCurrency(n)}
              className="block text-4xl md:text-5xl font-bold tracking-tight font-mono neon-text-cyan mb-3"
            />

            {lastMonthSnapshot && (
              <div className={cn(
                'inline-flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5',
                'border backdrop-blur-sm',
                isPositive ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                isNegative ? 'bg-red-500/10 border-red-500/25 text-red-300' :
                'bg-white/5 border-white/10 text-white/60'
              )}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> :
                 isNegative ? <TrendingDown className="h-3.5 w-3.5" /> :
                 <Minus className="h-3.5 w-3.5" />}
                {formatPercent(changePercent)} <span className="opacity-50">· dernier cycle</span>
              </div>
            )}
          </div>

          {/* Hunter rank emblem */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="flex items-center justify-center h-14 w-14 font-mono font-black text-2xl"
              style={{
                color: rank.color,
                background: `${rank.color}14`,
                boxShadow: `0 0 22px ${rank.color}66`,
                textShadow: `0 0 14px ${rank.color}`,
                clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
              }}
            >
              {rank.letter}
            </div>
            <span
              className="text-[9px] font-mono uppercase tracking-[0.2em] mt-1.5"
              style={{ color: rank.color }}
            >
              {rank.name}
            </span>
            {nextRank && (
              <span className="text-[8px] font-mono text-cyan-100/30 mt-0.5">
                {rankProgress.toFixed(0)}% → {nextRank.letter}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

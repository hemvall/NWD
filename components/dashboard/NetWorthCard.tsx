'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
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

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-4" />
        <div className="h-10 w-48 bg-white/10 rounded mb-2" />
        <div className="h-4 w-32 bg-white/5 rounded" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/15 to-pink-600/10" />
      <div className="absolute inset-0 bg-[#080d1a]/60 backdrop-blur-xl" />

      {/* Glow effects */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="relative z-10">
        <p className="text-cyan-300/60 text-xs font-medium uppercase tracking-widest mb-2">Total Net Worth</p>
        <p className="text-4xl md:text-5xl font-bold tracking-tight font-mono neon-text-cyan mb-3">
          {formatCurrency(netWorth)}
        </p>
        {lastMonthSnapshot && (
          <div className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full',
            'backdrop-blur-sm border',
            isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            isNegative ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-white/5 border-white/10 text-white/60'
          )}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> :
             isNegative ? <TrendingDown className="h-3.5 w-3.5" /> :
             <Minus className="h-3.5 w-3.5" />}
            {formatPercent(changePercent)} vs last month
          </div>
        )}
      </div>
    </div>
  )
}

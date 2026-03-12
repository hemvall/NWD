'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import type { NetWorthSnapshot } from '@/lib/types'

interface Props {
  totalAssets: number
  totalLiabilities: number
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

export default function StatsRow({ totalAssets, totalLiabilities, snapshots, isLoading }: Props) {
  const lastMonth = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const netWorthChange = lastMonth ? (totalAssets - totalLiabilities) - lastMonth.net_worth : null

  const stats = [
    {
      label: 'Total Assets',
      value: totalAssets,
      icon: TrendingUp,
      neonClass: 'neon-text-green',
      glowColor: 'rgba(52,211,153,0.15)',
      borderColor: 'border-emerald-500/10',
    },
    {
      label: 'Total Liabilities',
      value: totalLiabilities,
      icon: TrendingDown,
      neonClass: 'neon-text-pink',
      glowColor: 'rgba(244,114,182,0.15)',
      borderColor: 'border-pink-500/10',
    },
    {
      label: 'Monthly Change',
      value: netWorthChange ?? 0,
      icon: Activity,
      neonClass: netWorthChange === null ? 'text-white/30' :
                 netWorthChange >= 0 ? 'neon-text-cyan' : 'neon-text-pink',
      glowColor: netWorthChange === null ? 'transparent' :
                 netWorthChange >= 0 ? 'rgba(34,211,238,0.15)' : 'rgba(244,114,182,0.15)',
      borderColor: 'border-cyan-500/10',
      isChange: true,
      noData: netWorthChange === null,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-3 w-16 bg-white/10 rounded mb-3" />
            <div className="h-6 w-24 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, neonClass, glowColor, borderColor, isChange, noData }) => (
        <div key={label} className={`glass-card p-4 ${borderColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: glowColor }}
            >
              <Icon className={`h-3.5 w-3.5 ${neonClass}`} />
            </div>
            <span className="text-xs text-white/40 font-medium">{label}</span>
          </div>
          <p className={`text-lg font-bold font-mono ${neonClass}`}>
            {noData ? '--' : isChange && value > 0 ? `+${formatCurrency(value)}` : formatCurrency(value)}
          </p>
        </div>
      ))}
    </div>
  )
}

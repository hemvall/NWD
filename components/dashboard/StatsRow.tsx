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
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Total Liabilities',
      value: totalLiabilities,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Monthly Change',
      value: netWorthChange ?? 0,
      icon: Activity,
      color: netWorthChange === null ? 'text-slate-500' :
             netWorthChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bg: 'bg-slate-50 dark:bg-slate-800',
      isChange: true,
      noData: netWorthChange === null,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-[#0b1526] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 animate-pulse">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded mb-3" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700/60 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg, isChange, noData }) => (
        <div key={label} className="bg-white dark:bg-[#0b1526] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${bg}`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
          </div>
          <p className={`text-lg font-bold ${color}`}>
            {noData ? '—' : isChange && value > 0 ? `+${formatCurrency(value)}` : formatCurrency(value)}
          </p>
        </div>
      ))}
    </div>
  )
}

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
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded mb-4" />
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700/60 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
      <p className="text-emerald-100 text-sm font-medium mb-1">Total Net Worth</p>
      <p className="text-4xl font-bold tracking-tight mb-3">
        {formatCurrency(netWorth)}
      </p>
      {lastMonthSnapshot && (
        <div className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full',
          isPositive ? 'bg-emerald-600/40 text-emerald-50' :
          isNegative ? 'bg-red-500/30 text-red-100' :
          'bg-white/20 text-emerald-50'
        )}>
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> :
           isNegative ? <TrendingDown className="h-3.5 w-3.5" /> :
           <Minus className="h-3.5 w-3.5" />}
          {formatPercent(changePercent)} vs last month
        </div>
      )}
    </div>
  )
}

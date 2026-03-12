'use client'

import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

interface MonthlyDelta {
  date: string
  label: string
  delta: number
  deltaAssets: number
  deltaLiabilities: number
}

export default function SavingsRate({ snapshots, isLoading }: Props) {
  const deltas: MonthlyDelta[] = useMemo(() => {
    if (snapshots.length < 2) return []
    const result: MonthlyDelta[] = []
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1]
      const curr = snapshots[i]
      result.push({
        date: curr.snapshot_date,
        label: format(new Date(curr.snapshot_date), 'MMM yyyy'),
        delta: curr.net_worth - prev.net_worth,
        deltaAssets: curr.total_assets - prev.total_assets,
        deltaLiabilities: curr.total_liabilities - prev.total_liabilities,
      })
    }
    return result.reverse()
  }, [snapshots])

  const avgDelta = useMemo(() => {
    if (deltas.length === 0) return 0
    return deltas.reduce((sum, d) => sum + d.delta, 0) / deltas.length
  }, [deltas])

  if (isLoading) {
    return <div className="h-32 glass-inner animate-pulse rounded-xl" />
  }

  if (deltas.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-white/20 text-xs glass-inner rounded-xl">
        Ajoutez 2+ snapshots pour voir l&apos;epargne
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-white/30">Historique</span>
        <div className="text-right">
          <span className="text-[10px] text-white/20 mr-2">Moyenne</span>
          <span className={`text-xs font-bold font-mono ${avgDelta >= 0 ? 'neon-text-green' : 'neon-text-pink'}`}>
            {avgDelta > 0 ? '+' : ''}{formatCurrency(avgDelta)}
          </span>
        </div>
      </div>

      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {deltas.map((d) => {
          const Icon = d.delta > 0 ? ArrowUpRight : d.delta < 0 ? ArrowDownRight : Minus
          const colorClass = d.delta > 0 ? 'neon-text-green' : d.delta < 0 ? 'neon-text-pink' : 'text-white/30'
          return (
            <div key={d.date} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                <span className="text-xs text-white/50 font-medium">{d.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-white/20 font-mono">
                  A {d.deltaAssets >= 0 ? '+' : ''}{formatCurrency(d.deltaAssets)}
                </span>
                <span className="text-[10px] text-white/20 font-mono">
                  L {d.deltaLiabilities >= 0 ? '+' : ''}{formatCurrency(d.deltaLiabilities)}
                </span>
                <span className={`text-xs font-semibold font-mono min-w-[80px] text-right ${colorClass}`}>
                  {d.delta > 0 ? '+' : ''}{formatCurrency(d.delta)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { Target } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Goal } from '@/lib/types'

interface Props {
  netWorth: number
  goal: Goal | null
  isLoading: boolean
}

export default function GoalTracker({ netWorth, goal, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-16 glass-inner animate-pulse rounded-xl" />
  }

  if (!goal) {
    return (
      <div className="glass-inner rounded-xl p-4 flex items-center gap-3">
        <Target className="h-4 w-4 text-white/20" />
        <p className="text-xs text-white/30">
          Definissez un objectif dans les{' '}
          <a href="/settings" className="neon-text-cyan hover:underline">Settings</a>
        </p>
      </div>
    )
  }

  const progress = goal.target_net_worth > 0
    ? Math.min(100, Math.max(0, (netWorth / goal.target_net_worth) * 100))
    : 0
  const remaining = goal.target_net_worth - netWorth

  return (
    <div className="glass-inner rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-medium text-white/60">{goal.label ?? 'Objectif'}</span>
        </div>
        <span className="text-xs font-bold font-mono neon-text-cyan">{progress.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(34,211,238,0.3)' }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/30">
        <span className="font-mono">{formatCurrency(netWorth, true)}</span>
        <span className="font-medium text-white/40">
          {remaining > 0 ? `${formatCurrency(remaining, true)} restants` : 'Objectif atteint !'}
        </span>
        <span className="font-mono">{formatCurrency(goal.target_net_worth, true)}</span>
      </div>
      {goal.target_date && (
        <p className="text-[10px] text-white/20 mt-1">Date cible: {formatDate(goal.target_date)}</p>
      )}
    </div>
  )
}

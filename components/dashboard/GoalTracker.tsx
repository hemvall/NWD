'use client'

import { Target } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Goal } from '@/lib/types'

interface Props {
  netWorth: number
  goal: Goal | null
  isLoading: boolean
}

export default function GoalTracker({ netWorth, goal, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded mb-4" />
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/30 rounded" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Net Worth Goal</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set a target in{' '}
          <a href="/settings" className="text-emerald-600 dark:text-emerald-400 hover:underline">Settings</a>
          {' '}to track your progress.
        </p>
      </div>
    )
  }

  const progress = goal.target_net_worth > 0
    ? Math.min(100, Math.max(0, (netWorth / goal.target_net_worth) * 100))
    : 0
  const remaining = goal.target_net_worth - netWorth

  return (
    <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {goal.label ?? 'Net Worth Goal'}
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{progress.toFixed(1)}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-3" />
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatCurrency(netWorth, true)} <span className="text-slate-400">current</span></span>
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {remaining > 0 ? `${formatCurrency(remaining, true)} to go` : 'Goal reached!'}
        </span>
        <span>{formatCurrency(goal.target_net_worth, true)} <span className="text-slate-400">target</span></span>
      </div>
      {goal.target_date && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Target date: {formatDate(goal.target_date)}
        </p>
      )}
    </div>
  )
}

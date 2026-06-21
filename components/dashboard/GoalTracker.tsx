'use client'

import { Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getLevel, getRank } from '@/lib/system'
import type { Goal } from '@/lib/types'

interface Props {
  netWorth: number
  goal: Goal | null
  isLoading: boolean
}

const SEGMENTS = 24
const NOTCH = 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'

export default function GoalTracker({ netWorth, goal, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-28 glass-inner animate-pulse rounded-xl" />
  }

  const level = getLevel(netWorth)
  const { current: rank, next: nextRank } = getRank(netWorth)

  // Pursue the goal until it's reached, then auto-advance to the next rank
  // so the bar never stays stuck at 100% (even past the deadline).
  const hasGoal = !!goal && goal.target_net_worth > 0
  const goalReached = hasGoal && netWorth >= goal!.target_net_worth
  const pursuingGoal = hasGoal && !goalReached

  const target = pursuingGoal ? goal!.target_net_worth : nextRank?.min ?? netWorth
  const base = pursuingGoal ? 0 : rank.min
  const progress = target > base
    ? Math.min(100, Math.max(0, ((netWorth - base) / (target - base)) * 100))
    : 100
  const remaining = Math.max(0, target - netWorth)
  const filled = Math.round((progress / 100) * SEGMENTS)
  const label = pursuingGoal
    ? goal!.label ?? 'Quête Principale'
    : `Ascension · Rang ${nextRank?.letter ?? 'MAX'}`

  return (
    <div className="glass-inner rounded-xl p-4">
      {/* Level + quest title + percent */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex flex-col items-center justify-center h-11 w-11 border border-cyan-400/40 bg-cyan-500/10 shrink-0"
            style={{ boxShadow: '0 0 14px rgba(34,211,238,0.25)', clipPath: NOTCH }}
          >
            <span className="text-[8px] font-mono text-cyan-300/60 leading-none">LV</span>
            <span className="text-base font-bold font-mono neon-text-cyan leading-none mt-0.5">{level}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-100/80">{label}</span>
            </div>
            <p className="text-[10px] font-mono text-cyan-100/30 mt-0.5">
              Rang <span style={{ color: rank.color }}>{rank.letter}</span> · {rank.name}
            </p>
          </div>
        </div>
        <span className="text-sm font-bold font-mono neon-text-cyan">{progress.toFixed(1)}%</span>
      </div>

      {/* Segmented EXP bar */}
      <div className="flex gap-[3px] mb-2">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 flex-1 transition-all duration-500"
            style={{
              background: i < filled ? 'linear-gradient(180deg,#67e8f9,#22d3ee)' : 'rgba(125,211,252,0.07)',
              boxShadow: i < filled ? '0 0 8px rgba(34,211,238,0.6)' : 'none',
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-100/30">
        <span>EXP {formatCurrency(Math.max(0, netWorth - base), true)}</span>
        <span className="text-cyan-100/55">
          {remaining > 0 ? `${formatCurrency(remaining, true)} → palier suiv.` : 'PALIER ATTEINT'}
        </span>
        <span>{formatCurrency(target, true)}</span>
      </div>

      {pursuingGoal && goal!.target_date && (
        <p className="text-[10px] font-mono text-cyan-100/20 mt-1.5">Échéance : {formatDate(goal!.target_date)}</p>
      )}
      {goalReached && (
        <p className="text-[10px] font-mono text-emerald-300/60 mt-1.5">
          ✓ Objectif {goal!.label ?? formatCurrency(goal!.target_net_worth, true)} atteint — cap sur le rang {nextRank?.letter ?? 'MAX'}
        </p>
      )}
    </div>
  )
}

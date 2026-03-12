'use client'

import { useMemo } from 'react'
import { Trophy, Check, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/lib/types'

interface Props {
  netWorth: number
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

const MILESTONES = [25_000, 35_000, 50_000, 75_000, 100_000]

function estimateTimeToMilestone(
  currentNW: number,
  target: number,
  avgMonthly: number | null,
): string {
  if (currentNW >= target) return 'Atteint'
  if (!avgMonthly || avgMonthly <= 0) return '--'
  const months = (target - currentNW) / avgMonthly
  const y = Math.floor(months / 12)
  const m = Math.round(months % 12)
  if (y === 0) return `~${m}mo`
  if (m === 0) return `~${y}a`
  return `~${y}a ${m}mo`
}

export default function MilestoneTracker({ netWorth, snapshots, isLoading }: Props) {
  const avgMonthly = useMemo(() => {
    if (snapshots.length < 2) return null
    const deltas: number[] = []
    for (let i = 1; i < snapshots.length; i++) {
      deltas.push(snapshots[i].net_worth - snapshots[i - 1].net_worth)
    }
    return deltas.reduce((a, b) => a + b, 0) / deltas.length
  }, [snapshots])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 glass-inner animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {MILESTONES.map((target, i) => {
        const reached = netWorth >= target
        const isCurrent = !reached && (i === 0 || netWorth >= MILESTONES[i - 1])
        const progress = Math.min(100, Math.max(0, (netWorth / target) * 100))
        const eta = estimateTimeToMilestone(netWorth, target, avgMonthly)

        return (
          <div
            key={target}
            className={`relative overflow-hidden rounded-xl p-3 transition-all duration-500 ${
              reached
                ? 'glass-inner border-emerald-500/20'
                : isCurrent
                ? 'glass-inner border-cyan-500/20 ring-1 ring-cyan-500/10'
                : 'glass-inner opacity-50'
            }`}
          >
            {/* Progress bar background */}
            {!reached && (
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/5 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            )}

            <div className="relative flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  reached
                    ? 'bg-emerald-500/20'
                    : isCurrent
                    ? 'bg-cyan-500/20'
                    : 'bg-white/5'
                }`}
              >
                {reached ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Trophy className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-white/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold tracking-wide font-mono ${
                      reached
                        ? 'neon-text-green'
                        : isCurrent
                        ? 'neon-text-cyan'
                        : 'text-white/30'
                    }`}
                  >
                    {formatCurrency(target)}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      reached
                        ? 'text-emerald-400/80'
                        : isCurrent
                        ? 'text-cyan-400/80'
                        : 'text-white/20'
                    }`}
                  >
                    {reached ? 'Atteint' : `${progress.toFixed(0)}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      reached
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : isCurrent
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                        : 'bg-white/10'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {!reached && (
                  <p className="text-[10px] text-white/30 mt-1">
                    ETA: {eta} &middot; Reste {formatCurrency(target - netWorth, true)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

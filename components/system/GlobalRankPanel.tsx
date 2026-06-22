'use client'

import { motion } from 'framer-motion'
import { Wallet, Dumbbell } from 'lucide-react'
import { useSnapshots } from '@/hooks/useSnapshots'
import { useAssets } from '@/hooks/useAssets'
import { useLiabilities } from '@/hooks/useLiabilities'
import { useSportProfile, useLiftLog, useBodyLog, useWorkoutLog } from '@/hooks/useSport'
import { getLevel, getRankByLevel } from '@/lib/system'
import { getSportLevel } from '@/lib/sport'

export default function GlobalRankPanel() {
  const { snapshots } = useSnapshots()
  const { totalAssets } = useAssets()
  const { totalLiabilities } = useLiabilities()
  const { profile } = useSportProfile()
  const { entries: lifts } = useLiftLog()
  const { entries: body } = useBodyLog()
  const { entries: workouts } = useWorkoutLog()

  const latest = snapshots.length ? snapshots[snapshots.length - 1] : null
  const netWorth = latest?.net_worth ?? totalAssets - totalLiabilities

  // Each section contributes its level; the global level is their sum.
  const financeLevel = netWorth > 0 ? getLevel(netWorth) : 0
  const sportLevel = profile ? getSportLevel(lifts, body.length, profile.weightKg, workouts.map(w => w.date)) : 0
  const globalLevel = financeLevel + sportLevel

  const { current: rank, next: nextRank, progress } = getRankByLevel(globalLevel)

  const sections = [
    { label: 'Finance', level: financeLevel, color: '#22d3ee', icon: Wallet },
    { label: 'Gym', level: sportLevel, color: '#34d399', icon: Dumbbell },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card relative overflow-hidden p-6 mb-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-400/10 to-transparent animate-[system-scan_6s_linear_infinite]" />
      <div className="absolute -top-24 -right-16 w-60 h-60 rounded-full blur-3xl animate-glow-pulse" style={{ background: `${rank.color}1a` }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-sm">⟦</span>
            <p className="text-cyan-300/70 text-[10px] font-mono font-medium uppercase tracking-[0.3em]">Rang Global</p>
            <span className="text-cyan-400 text-sm">⟧</span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-200/50 border border-cyan-400/25 px-2 py-0.5">
            {sections.filter(s => s.level > 0).length} sections actives
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-4xl md:text-5xl font-bold font-mono tracking-tight" style={{ color: rank.color, textShadow: `0 0 16px ${rank.color}80` }}>
              Niveau {globalLevel}
            </p>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] mt-1" style={{ color: rank.color }}>
              Rang {rank.letter} · {rank.name}
            </p>
          </div>

          {/* Global rank emblem */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="flex items-center justify-center h-16 w-16 font-mono font-black text-3xl"
              style={{
                color: rank.color,
                background: `${rank.color}14`,
                boxShadow: `0 0 26px ${rank.color}66`,
                textShadow: `0 0 16px ${rank.color}`,
                clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
              }}
            >
              {rank.letter}
            </div>
          </div>
        </div>

        {/* Progress to next global rank */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-100/40 mb-1.5">
            <span>EXP cumulée — toutes sections</span>
            <span>{nextRank ? `${progress.toFixed(0)}% → Rang ${nextRank.letter}` : 'RANG MAX'}</span>
          </div>
          <div className="h-2.5 bg-cyan-400/10 overflow-hidden rounded-sm">
            <motion.div
              className="h-full rounded-sm"
              style={{ background: `linear-gradient(90deg, ${rank.color}, #67e8f9)`, boxShadow: `0 0 10px ${rank.color}88` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Per-section contribution */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {sections.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="glass-inner rounded-lg px-3 py-2 flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-100/40 truncate">{s.label}</p>
                  <p className="text-sm font-mono font-bold" style={{ color: s.color }}>
                    {s.level > 0 ? `Niveau ${s.level}` : 'Inactif'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

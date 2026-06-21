'use client'

import { getRankByLevel } from '@/lib/system'
import {
  bmi, bmiLabel, getSportLevel, OBJECTIVES,
  type SportProfile, type LiftEntry,
} from '@/lib/sport'

interface Props {
  profile: SportProfile
  lifts: LiftEntry[]
  bodyEntries: number
}

export default function SportProfileCard({ profile, lifts, bodyEntries }: Props) {
  const level = getSportLevel(lifts, bodyEntries, profile.weightKg)
  const { current: rank, next: nextRank, progress } = getRankByLevel(level)
  const bmiValue = bmi(profile)
  const bmiTag = bmiLabel(bmiValue)
  const objLabel = OBJECTIVES.find(o => o.value === profile.objective)?.label ?? profile.objective

  return (
    <div className="glass-card relative overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-400/10 to-transparent animate-[system-scan_6s_linear_infinite]" />
      <div className="absolute -top-24 -right-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-sm">⟦</span>
            <p className="text-cyan-300/70 text-[10px] font-mono font-medium uppercase tracking-[0.3em]">Statut · Joueur</p>
            <span className="text-cyan-400 text-sm">⟧</span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-200/50 border border-cyan-400/25 px-2 py-0.5">
            {objLabel}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl md:text-4xl font-bold tracking-tight font-mono neon-text-cyan">{profile.name}</p>
            <p className="text-[11px] font-mono text-cyan-100/40 mt-1">
              {profile.age} ans · {profile.heightCm} cm · {profile.weightKg} kg
            </p>
          </div>

          {/* Gym rank emblem */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="flex items-center justify-center h-14 w-14 font-mono font-black text-2xl"
              style={{
                color: rank.color,
                background: `${rank.color}14`,
                boxShadow: `0 0 22px ${rank.color}66`,
                textShadow: `0 0 14px ${rank.color}`,
                clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
              }}
            >
              {rank.letter}
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] mt-1.5" style={{ color: rank.color }}>
              {rank.name}
            </span>
            <span className="text-[8px] font-mono text-cyan-100/30 mt-0.5">
              LV {level}{nextRank ? ` · ${progress.toFixed(0)}% → ${nextRank.letter}` : ''}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="glass-inner rounded-lg p-2.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-100/40">IMC</p>
            <p className="text-sm font-mono font-bold" style={{ color: bmiTag.color }}>{bmiValue.toFixed(1)}</p>
            <p className="text-[8px] font-mono" style={{ color: bmiTag.color }}>{bmiTag.label}</p>
          </div>
          <div className="glass-inner rounded-lg p-2.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-100/40">Niveau Gym</p>
            <p className="text-sm font-mono font-bold neon-text-cyan">{level}</p>
            <p className="text-[8px] font-mono text-cyan-100/30">Rang {rank.letter}</p>
          </div>
          <div className="glass-inner rounded-lg p-2.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-100/40">Poids cible</p>
            <p className="text-sm font-mono font-bold text-cyan-100/80">
              {profile.targetWeightKg ? `${profile.targetWeightKg} kg` : '--'}
            </p>
            <p className="text-[8px] font-mono text-cyan-100/30">
              {profile.targetWeightKg ? `${(profile.targetWeightKg - profile.weightKg > 0 ? '+' : '')}${(profile.targetWeightKg - profile.weightKg).toFixed(1)} kg` : 'non défini'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Dumbbell, BarChart3, Activity, Scale, Zap } from 'lucide-react'
import { getRankByLevel } from '@/lib/system'
import { getSportProgress, XP_RULES, type LiftEntry } from '@/lib/sport'

interface Props {
  lifts: LiftEntry[]
  bodyEntries: number
  bodyWeightKg: number
  workoutDates?: string[]
}

export default function LevelProgress({ lifts, bodyEntries, bodyWeightKg, workoutDates = [] }: Props) {
  const p = getSportProgress(lifts, bodyEntries, bodyWeightKg, workoutDates)
  const { current: rank, next: nextRank } = getRankByLevel(p.level)
  const pct = (p.xpIntoLevel / XP_RULES.xpPerLevel) * 100

  const sources = [
    {
      icon: Dumbbell,
      label: 'Force actuelle',
      detail: `${Math.round(p.force).toLocaleString('fr-FR')} kg de charge estimée`,
      xp: p.forceXp,
      rule: '≈ 1 XP / kg',
    },
    {
      icon: BarChart3,
      label: 'Volume soulevé',
      detail: `${Math.round(p.totalVolume).toLocaleString('fr-FR')} kg cumulés`,
      xp: p.volumeXp,
      rule: `1 XP / ${XP_RULES.volumeKgPerXp.toLocaleString('fr-FR')} kg`,
    },
    {
      icon: Activity,
      label: 'Séances',
      detail: `${p.sessions} jour${p.sessions > 1 ? 's' : ''} d'entraînement`,
      xp: p.sessionXp,
      rule: `${XP_RULES.xpPerSession} XP / séance`,
    },
    {
      icon: Scale,
      label: 'Pesées',
      detail: `${p.weighIns} pesée${p.weighIns > 1 ? 's' : ''} enregistrée${p.weighIns > 1 ? 's' : ''}`,
      xp: p.weighInXp,
      rule: `${XP_RULES.xpPerWeighIn} XP / pesée`,
    },
  ]

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Progression de niveau</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border" style={{ color: rank.color, borderColor: `${rank.color}55` }}>
          Niveau {p.level} · {rank.letter}
        </span>
      </div>

      {/* XP toward next level */}
      <div className="glass-inner rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-100/40 mb-1.5">
          <span>EXP · niveau {p.level}</span>
          <span className="text-cyan-100/60">{p.xpIntoLevel} / {XP_RULES.xpPerLevel} XP</span>
        </div>
        <div className="h-2.5 bg-cyan-400/10 overflow-hidden rounded-sm">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-700"
            style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(34,211,238,0.5)' }} />
        </div>
        <p className="text-[10px] font-mono text-cyan-100/40 mt-1.5 text-center">
          Encore <span className="neon-text-cyan">{p.xpForNext} XP</span> pour le niveau {p.level + 1}
          {nextRank ? ` · rang ${nextRank.letter} au niveau ${nextRank.minLevel}` : ''}
        </p>
      </div>

      {/* XP sources — how to level up */}
      <div className="space-y-2">
        {sources.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3 glass-inner rounded-lg px-3 py-2.5">
              <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-100/70">{s.label}</span>
                  <span className="text-xs font-mono font-bold neon-text-cyan">+{s.xp} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyan-100/30">{s.detail}</span>
                  <span className="text-[9px] font-mono text-cyan-100/30">{s.rule}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] font-mono text-cyan-100/30 mt-4 leading-relaxed">
        <span className="text-cyan-200/60">Pour monter :</span> deviens plus fort (charges &amp; reps — le poids du corps compte pour tractions/dips),
        accumule du volume, entraîne-toi régulièrement et pèse-toi. {XP_RULES.xpPerLevel} XP = 1 niveau.
      </p>
    </div>
  )
}

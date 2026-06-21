'use client'

import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { calorieTarget, macros, tdee, PHASES, type SportProfile, type Phase } from '@/lib/sport'

interface Props {
  profile: SportProfile
  onPhaseChange: (phase: Phase) => void
  detailed?: boolean
}

export default function DietCard({ profile, onPhaseChange, detailed }: Props) {
  const m = macros(profile)
  const maintenance = Math.round(tdee(profile) / 10) * 10
  const target = calorieTarget(profile)
  const diff = target - maintenance

  const macroItems = [
    { label: 'Protéines', value: m.protein, unit: 'g', icon: Beef, color: '#f472b6' },
    { label: 'Glucides', value: m.carbs, unit: 'g', icon: Wheat, color: '#f59e0b' },
    { label: 'Lipides', value: m.fat, unit: 'g', icon: Droplet, color: '#22d3ee' },
  ]

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Diète &amp; Phase</h3>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border"
          style={{ color: PHASES[profile.phase].color, borderColor: `${PHASES[profile.phase].color}55` }}>
          {PHASES[profile.phase].label}
        </span>
      </div>

      {/* Phase switch */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(PHASES) as Phase[]).map(p => {
          const active = profile.phase === p
          const c = PHASES[p].color
          return (
            <button
              key={p}
              onClick={() => onPhaseChange(p)}
              className="system-tab flex flex-col items-center gap-0.5 border px-2 py-2 text-[10px] font-mono uppercase tracking-wider transition-all"
              style={{
                color: active ? c : 'rgba(186,230,253,0.4)',
                borderColor: active ? `${c}66` : 'rgba(56,189,248,0.12)',
                background: active ? `${c}14` : 'transparent',
                boxShadow: active ? `0 0 14px ${c}33` : 'none',
              }}
            >
              {PHASES[p].label}
            </button>
          )
        })}
      </div>

      {/* Calories */}
      <div className="glass-inner rounded-lg p-4 mb-3 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-100/40">Objectif calorique / jour</p>
        <p className="text-3xl font-mono font-bold neon-text-cyan mt-1">{target.toLocaleString('fr-FR')} <span className="text-base text-cyan-100/40">kcal</span></p>
        <p className="text-[10px] font-mono mt-1" style={{ color: diff >= 0 ? '#34d399' : '#f472b6' }}>
          {diff >= 0 ? '+' : ''}{diff} kcal vs maintien ({maintenance.toLocaleString('fr-FR')})
        </p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        {macroItems.map(mi => {
          const Icon = mi.icon
          return (
            <div key={mi.label} className="glass-inner rounded-lg p-3 text-center">
              <Icon className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: mi.color }} />
              <p className="text-base font-mono font-bold" style={{ color: mi.color }}>{mi.value}{mi.unit}</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-cyan-100/40">{mi.label}</p>
            </div>
          )
        })}
      </div>

      {detailed && (
        <p className="text-[10px] font-mono text-cyan-100/30 mt-4 leading-relaxed">
          {PHASES[profile.phase].desc}. Estimation basée sur la formule de Mifflin-St Jeor (métabolisme {Math.round(tdee(profile) / ({ sedentaire: 1.2, leger: 1.375, modere: 1.55, actif: 1.725, tres_actif: 1.9 }[profile.activity]))} kcal) × activité.
          Protéines {profile.phase === 'cut' ? '2,2' : '2,0'} g/kg, lipides 25 % des calories, glucides pour le reste.
        </p>
      )}
    </div>
  )
}

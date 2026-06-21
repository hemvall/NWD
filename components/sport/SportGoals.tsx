'use client'

import { useState } from 'react'
import { Target, Check } from 'lucide-react'
import {
  LIFTS, LIFT_KEYS, bestWeight, formatKg,
  type SportProfile, type LiftEntry, type LiftKey,
} from '@/lib/sport'

interface Props {
  profile: SportProfile
  lifts: LiftEntry[]
  onSave: (patch: Partial<SportProfile>) => void
}

const fieldCls = 'w-full bg-[#0a1426] border border-cyan-400/20 text-cyan-50 text-sm font-mono px-3 py-2 rounded-sm outline-none focus:border-cyan-400/60 transition-colors'
const labelCls = 'text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200/60 mb-1.5 block'

export default function SportGoals({ profile, lifts, onSave }: Props) {
  const [targetWeight, setTargetWeight] = useState(profile.targetWeightKg?.toString() ?? '')
  const [targets, setTargets] = useState<Record<LiftKey, string>>(() => {
    const init = {} as Record<LiftKey, string>
    for (const k of LIFT_KEYS) init[k] = profile.liftTargets?.[k]?.toString() ?? ''
    return init
  })
  const [saved, setSaved] = useState(false)

  function setTarget(k: LiftKey, v: string) {
    setTargets(prev => ({ ...prev, [k]: v }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const liftTargets: Partial<Record<LiftKey, number | null>> = {}
    for (const k of LIFT_KEYS) liftTargets[k] = targets[k] ? +targets[k] : null
    onSave({
      targetWeightKg: targetWeight ? +targetWeight : null,
      liftTargets,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-cyan-400" />
        <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Objectifs de progression</h3>
      </div>

      {/* Progress bars */}
      <div className="space-y-2.5 mb-5">
        {LIFT_KEYS.map(k => {
          const maxW = bestWeight(lifts, k)
          const t = +(targets[k] || 0)
          const progress = t > 0 ? Math.min(100, (maxW / t) * 100) : 0
          return (
            <div key={k}>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-cyan-100/60 uppercase tracking-wider">{LIFTS[k].label}</span>
                <span className="text-cyan-100/40">{maxW > 0 ? formatKg(maxW) : '--'}{t > 0 ? ` / ${t} kg` : ''}</span>
              </div>
              <div className="h-2 bg-cyan-400/10 overflow-hidden rounded-sm">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-700"
                  style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(34,211,238,0.5)' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit targets */}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Poids cible (kg)</label>
          <input type="number" step="0.1" className={fieldCls} value={targetWeight} onChange={e => setTargetWeight(e.target.value)} placeholder="kg" />
        </div>
        {LIFT_KEYS.map(k => (
          <div key={k}>
            <label className={labelCls}>{LIFTS[k].label}</label>
            <input type="number" className={fieldCls} value={targets[k]} onChange={e => setTarget(k, e.target.value)} placeholder="charge cible (kg)" />
          </div>
        ))}
        <div className="col-span-2">
          <button type="submit" className="flex w-full items-center justify-center gap-2 border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-widest text-cyan-200 transition-all hover:bg-cyan-500/20">
            {saved ? <><Check className="h-4 w-4" /> Enregistré</> : 'Enregistrer les objectifs'}
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Dumbbell, Plus, Trash2 } from 'lucide-react'
import { todayISO } from '@/lib/utils'
import {
  LIFTS, LIFT_KEYS, bestSet, bestWeight,
  type LiftEntry, type LiftKey, type SportProfile,
} from '@/lib/sport'

interface Props {
  entries: LiftEntry[]
  profile: SportProfile
  onAdd: (entry: Omit<LiftEntry, 'id'>) => void
  onDelete: (id: string) => void
}

function setLabel(weightKg: number, reps: number, sets = 1): string {
  const base = weightKg > 0 ? `${weightKg} kg × ${reps}` : `${reps} reps (PdC)`
  return sets > 1 ? `${sets} × ${base}` : base
}

export default function LiftsPanel({ entries, profile, onAdd, onDelete }: Props) {
  const [lift, setLift] = useState<LiftKey>('dc_halteres')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState('')
  const [date, setDate] = useState(todayISO())

  const fieldCls = 'bg-[#0a1426] border border-cyan-400/20 text-cyan-50 text-sm font-mono px-3 py-2 rounded-sm outline-none focus:border-cyan-400/60 transition-colors'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reps || +reps <= 0) return
    onAdd({
      lift,
      weightKg: weight ? +weight : 0,
      reps: Math.round(+reps),
      sets: sets && +sets > 0 ? Math.round(+sets) : 1,
      date,
    })
    setWeight('')
    setReps('')
    setSets('')
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="h-4 w-4 text-cyan-400" />
        <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Forces · Records</h3>
      </div>

      {/* Add form */}
      <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-2">
        <select value={lift} onChange={e => setLift(e.target.value as LiftKey)} className={`${fieldCls} col-span-2 sm:col-span-1`}>
          {LIFT_KEYS.map(k => <option key={k} value={k} className="bg-[#0a1426]">{LIFTS[k].short}</option>)}
        </select>
        <input type="number" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg (vide = PdC)" className={fieldCls} />
        <input type="number" value={sets} onChange={e => setSets(e.target.value)} placeholder="séries" className={fieldCls} />
        <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="reps" className={fieldCls} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fieldCls} />
        <button type="submit" className="flex items-center justify-center px-3 border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </form>
      <p className="text-[10px] font-mono text-cyan-100/25 mb-4">Poids vide = série au poids du corps (tractions, dips…). Séries vide = 1.</p>

      {/* Record cards (best set, not a fake 1RM) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {LIFT_KEYS.map(k => {
          const best = bestSet(entries, k, profile.weightKg)
          const maxW = bestWeight(entries, k)
          const targetVal = profile.liftTargets?.[k] ?? null
          const progress = targetVal && targetVal > 0 ? Math.min(100, (maxW / targetVal) * 100) : null
          return (
            <div key={k} className="glass-inner rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-100/50">{LIFTS[k].label}</span>
                <span className="text-[9px] font-mono text-cyan-100/30">record</span>
              </div>
              <p className="text-base font-mono font-bold neon-text-cyan mt-0.5">
                {best ? setLabel(best.weightKg, best.reps, best.sets) : '--'}
              </p>
              {progress !== null && (
                <>
                  <div className="mt-1.5 h-[3px] bg-cyan-400/10 overflow-hidden">
                    <div className="h-full bg-cyan-400/60 transition-all duration-700" style={{ width: `${progress}%`, boxShadow: '0 0 6px rgba(34,211,238,0.5)' }} />
                  </div>
                  <p className="text-[9px] font-mono text-cyan-100/30 mt-1">Charge max {maxW} / {targetVal} kg · {progress.toFixed(0)}%</p>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* History */}
      {entries.length > 0 && (
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {[...entries].reverse().slice(0, 8).map(e => (
            <div key={e.id} className="flex items-center justify-between glass-inner rounded-md px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase text-cyan-300/60 border border-cyan-400/20 px-1.5 py-px">{LIFTS[e.lift].short}</span>
                <span className="text-[11px] font-mono text-cyan-100/60">{setLabel(e.weightKg, e.reps, e.sets)}</span>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-cyan-100/20 hover:text-pink-400 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

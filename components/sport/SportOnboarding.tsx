'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, ChevronRight } from 'lucide-react'
import {
  GENDERS, EXPERIENCES, ACTIVITIES, OBJECTIVES, PHASES,
  type SportProfile, type Gender, type Experience, type Activity, type SportObjective, type Phase,
} from '@/lib/sport'

interface Props {
  initial?: SportProfile | null
  submitLabel?: string
  onSave: (profile: SportProfile) => void
}

const fieldCls =
  'w-full bg-[#0a1426] border border-cyan-400/20 text-cyan-50 text-sm font-mono px-3 py-2 rounded-sm outline-none focus:border-cyan-400/60 transition-colors'
const labelCls = 'text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200/60 mb-1.5 block'

export default function SportOnboarding({ initial, submitLabel = 'Initialiser le profil', onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'homme')
  const [age, setAge] = useState(initial?.age?.toString() ?? '')
  const [height, setHeight] = useState(initial?.heightCm?.toString() ?? '')
  const [weight, setWeight] = useState(initial?.weightKg?.toString() ?? '')
  const [targetWeight, setTargetWeight] = useState(initial?.targetWeightKg?.toString() ?? '')
  const [experience, setExperience] = useState<Experience>(initial?.experience ?? 'debutant')
  const [activity, setActivity] = useState<Activity>(initial?.activity ?? 'modere')
  const [objective, setObjective] = useState<SportObjective>(initial?.objective ?? 'prise_de_masse')
  const [phase, setPhase] = useState<Phase>(initial?.phase ?? 'bulk')

  const valid = name.trim() && +age > 0 && +height > 0 && +weight > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onSave({
      name: name.trim(),
      gender,
      age: Math.round(+age),
      heightCm: Math.round(+height),
      weightKg: +weight,
      experience,
      activity,
      objective,
      phase,
      targetWeightKg: targetWeight ? +targetWeight : null,
      liftTargets: initial?.liftTargets,
      calorieOverride: initial?.calorieOverride ?? null,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card relative overflow-hidden p-6 max-w-2xl mx-auto"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-400/10 to-transparent" />

      {!initial && (
        <div className="relative mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-cyan-400/40 bg-cyan-500/10"
            style={{ boxShadow: '0 0 18px rgba(34,211,238,0.3)', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
            <Dumbbell className="h-5 w-5 text-cyan-300" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/70">Initialisation requise</p>
          <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-cyan-100 mt-1">Profil du Joueur</h2>
          <p className="text-[11px] font-mono text-cyan-100/40 mt-1">
            Le Système a besoin de vos données pour calibrer vos objectifs.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Nom du joueur</label>
          <input className={fieldCls} value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" />
        </div>

        <div>
          <label className={labelCls}>Sexe</label>
          <select className={fieldCls} value={gender} onChange={e => setGender(e.target.value as Gender)}>
            {GENDERS.map(g => <option key={g.value} value={g.value} className="bg-[#0a1426]">{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Âge</label>
          <input type="number" className={fieldCls} value={age} onChange={e => setAge(e.target.value)} placeholder="ans" />
        </div>

        <div>
          <label className={labelCls}>Taille (cm)</label>
          <input type="number" className={fieldCls} value={height} onChange={e => setHeight(e.target.value)} placeholder="cm" />
        </div>
        <div>
          <label className={labelCls}>Poids actuel (kg)</label>
          <input type="number" step="0.1" className={fieldCls} value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg" />
        </div>

        <div>
          <label className={labelCls}>Niveau d&apos;expérience</label>
          <select className={fieldCls} value={experience} onChange={e => setExperience(e.target.value as Experience)}>
            {EXPERIENCES.map(x => <option key={x.value} value={x.value} className="bg-[#0a1426]">{x.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Niveau d&apos;activité</label>
          <select className={fieldCls} value={activity} onChange={e => setActivity(e.target.value as Activity)}>
            {ACTIVITIES.map(x => <option key={x.value} value={x.value} className="bg-[#0a1426]">{x.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Objectif principal</label>
          <select className={fieldCls} value={objective} onChange={e => setObjective(e.target.value as SportObjective)}>
            {OBJECTIVES.map(x => <option key={x.value} value={x.value} className="bg-[#0a1426]">{x.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Phase actuelle</label>
          <select className={fieldCls} value={phase} onChange={e => setPhase(e.target.value as Phase)}>
            {(Object.keys(PHASES) as Phase[]).map(p => (
              <option key={p} value={p} className="bg-[#0a1426]">{PHASES[p].label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Poids cible (kg) — optionnel</label>
          <input type="number" step="0.1" className={fieldCls} value={targetWeight} onChange={e => setTargetWeight(e.target.value)} placeholder="objectif de poids" />
        </div>

        <div className="sm:col-span-2 mt-1">
          <button
            type="submit"
            disabled={!valid}
            className="group flex w-full items-center justify-center gap-2 border border-cyan-400/50 bg-cyan-500/10 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-cyan-200 transition-all hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}
          >
            {submitLabel}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </motion.div>
  )
}

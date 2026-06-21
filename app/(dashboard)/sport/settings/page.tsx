'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash2, Flame, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import SportOnboarding from '@/components/sport/SportOnboarding'
import { useSportProfile } from '@/hooks/useSport'
import { tdee, calorieTarget } from '@/lib/sport'

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span className="text-cyan-400 text-[10px]" style={{ textShadow: '0 0 8px rgba(34,211,238,0.7)' }}>◆</span>
        <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.22em] text-cyan-200/90">{title}</h2>
        <div className="flex-1 h-px system-divider" />
      </div>
      {subtitle && <p className="text-[10px] font-mono text-cyan-100/30 mt-1.5 ml-[22px] tracking-wide">{subtitle}</p>}
    </div>
  )
}

export default function SportSettingsPage() {
  const router = useRouter()
  const { profile, isLoading, saveProfile, updateProfile } = useSportProfile()

  const [override, setOverride] = useState('')
  const [overrideSaved, setOverrideSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return }
    try {
      localStorage.removeItem('nwd_sport_profile')
      localStorage.removeItem('nwd_sport_body')
      localStorage.removeItem('nwd_sport_lifts')
    } catch {
      // ignore
    }
    router.push('/sport')
    router.refresh()
  }

  function saveOverride(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ calorieOverride: override ? +override : null })
    setOverrideSaved(true)
    setTimeout(() => setOverrideSaved(false), 2000)
  }

  const fieldCls = 'w-full bg-[#0a1426] border border-cyan-400/20 text-cyan-50 text-sm font-mono px-3 py-2 rounded-sm outline-none focus:border-cyan-400/60 transition-colors'

  return (
    <>
      <Header title="⟦ GYM · RÉGLAGES ⟧" />
      <main className="system-ui flex-1 px-4 md:px-6 py-5 max-w-2xl mx-auto w-full space-y-8">
        {isLoading ? (
          <div className="h-64 glass-card animate-pulse" />
        ) : !profile ? (
          <p className="text-sm font-mono text-cyan-100/40 text-center py-10">
            Aucun profil. Rendez-vous sur la section Gym pour l&apos;initialiser.
          </p>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <SectionHeader title="Profil du joueur" subtitle="Modifiez vos données — les calories et objectifs sont recalculés" />
              <SportOnboarding initial={profile} submitLabel="Mettre à jour le profil" onSave={saveProfile} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <SectionHeader title="Calories manuelles" subtitle="Forcer un objectif calorique (laisser vide pour calcul automatique)" />
              <form onSubmit={saveOverride} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-cyan-400" />
                  <span className="text-[11px] font-mono text-cyan-100/50">
                    Auto : maintien {Math.round(tdee(profile) / 10) * 10} kcal · cible actuelle {calorieTarget(profile)} kcal
                  </span>
                </div>
                <div className="flex gap-2">
                  <input type="number" className={fieldCls} value={override} onChange={e => setOverride(e.target.value)}
                    placeholder={profile.calorieOverride ? `${profile.calorieOverride} kcal` : 'kcal / jour'} />
                  <button type="submit" className="shrink-0 flex items-center gap-1.5 border border-cyan-400/50 bg-cyan-500/10 px-4 text-xs font-mono uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/20 transition-all">
                    {overrideSaved ? <><Check className="h-4 w-4" /> OK</> : 'Définir'}
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SectionHeader title="Zone de danger" subtitle="Réinitialise le profil, les pesées et les performances" />
              <div className="glass-card p-5" style={{ borderColor: 'rgba(244,114,182,0.3)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="h-4 w-4 text-pink-400" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-pink-300">Réinitialiser la section Gym</span>
                </div>
                <p className="text-[11px] font-mono text-cyan-100/30 mb-4">Action irréversible. Toutes les données gym seront effacées.</p>
                <button onClick={handleReset}
                  className="border border-pink-400/50 bg-pink-500/10 px-4 py-2 text-xs font-mono uppercase tracking-widest text-pink-200 hover:bg-pink-500/20 transition-all">
                  {confirmReset ? 'Cliquez à nouveau pour confirmer' : 'Tout réinitialiser'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Dumbbell, Flame, Target, CalendarDays } from 'lucide-react'
import Header from '@/components/layout/Header'
import SportOnboarding from '@/components/sport/SportOnboarding'
import SportProfileCard from '@/components/sport/SportProfileCard'
import LevelProgress from '@/components/sport/LevelProgress'
import DietCard from '@/components/sport/DietCard'
import BodyWeightPanel from '@/components/sport/BodyWeightPanel'
import LiftsPanel from '@/components/sport/LiftsPanel'
import WorkoutCalendar from '@/components/sport/WorkoutCalendar'
import SportGoals from '@/components/sport/SportGoals'
import { useSportProfile, useBodyLog, useLiftLog, useWorkoutLog } from '@/hooks/useSport'
import type { Phase } from '@/lib/sport'

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'stats', label: 'Stats', icon: Dumbbell },
  { id: 'calendar', label: 'Séances', icon: CalendarDays },
  { id: 'diet', label: 'Diète', icon: Flame },
  { id: 'goals', label: 'Objectifs', icon: Target },
] as const

type TabId = (typeof TABS)[number]['id']

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

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function SportPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { profile, isLoading, saveProfile, updateProfile } = useSportProfile()
  const { entries: body, addEntry: addBody, deleteEntry: delBody } = useBodyLog()
  const { entries: lifts, addEntry: addLift, deleteEntry: delLift } = useLiftLog()
  const { entries: workouts, setWorkout, removeWorkout } = useWorkoutLog()

  const workoutDates = workouts.map(w => w.date)
  const setPhase = (phase: Phase) => updateProfile({ phase })

  return (
    <>
      <Header title="⟦ GYM ⟧" />
      <main className="system-ui flex-1 px-4 md:px-6 py-5 max-w-5xl mx-auto w-full">
        {isLoading ? (
          <div className="h-64 glass-card animate-pulse" />
        ) : !profile ? (
          <SportOnboarding onSave={saveProfile} />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`system-tab relative flex items-center gap-2 px-4 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap border ${activeTab === id
                      ? 'text-cyan-200 border-cyan-400/50 bg-cyan-500/10'
                      : 'text-cyan-100/30 border-cyan-400/10 hover:text-cyan-100/60 hover:border-cyan-400/30'
                    }`}
                  style={activeTab === id ? { boxShadow: '0 0 16px rgba(34,211,238,0.22)' } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {activeTab === id && (
                    <motion.div layoutId="sport-tab-glow" className="absolute inset-0 bg-cyan-500/5"
                      transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }} />
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" {...fadeSlide}>
                  <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
                    <motion.div variants={item}>
                      <SportProfileCard profile={profile} lifts={lifts} bodyEntries={body.length} workoutDates={workoutDates} />
                    </motion.div>
                    <motion.div variants={item}>
                      <LevelProgress lifts={lifts} bodyEntries={body.length} bodyWeightKg={profile.weightKg} workoutDates={workoutDates} />
                    </motion.div>
                    <motion.div variants={item}>
                      <DietCard profile={profile} onPhaseChange={setPhase} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div key="stats" {...fadeSlide}>
                  <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                    <motion.div variants={item}>
                      <SectionHeader title="Poids corporel" subtitle="Suivez l'évolution de votre poids dans le temps" />
                      <BodyWeightPanel entries={body} targetWeightKg={profile.targetWeightKg} onAdd={addBody} onDelete={delBody} />
                    </motion.div>
                    <motion.div variants={item}>
                      <SectionHeader title="Forces" subtitle="Enregistrez vos séries et suivez vos 1RM estimés" />
                      <LiftsPanel entries={lifts} profile={profile} onAdd={addLift} onDelete={delLift} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div key="calendar" {...fadeSlide}>
                  <motion.div variants={item}>
                    <SectionHeader title="Calendrier" subtitle="Marquez votre séance du jour — Push · Pull · Legs · Arms" />
                    <WorkoutCalendar entries={workouts} onSet={setWorkout} onRemove={removeWorkout} />
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'diet' && (
                <motion.div key="diet" {...fadeSlide}>
                  <motion.div variants={item}>
                    <SectionHeader title="Diète & phase" subtitle="Calories et macros calibrées selon votre phase et votre profil" />
                    <DietCard profile={profile} onPhaseChange={setPhase} detailed />
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'goals' && (
                <motion.div key="goals" {...fadeSlide}>
                  <motion.div variants={item}>
                    <SectionHeader title="Objectifs" subtitle="Définissez vos cibles de poids et de force" />
                    <SportGoals profile={profile} lifts={lifts} onSave={updateProfile} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </>
  )
}

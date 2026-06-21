'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, History, TrendingUp, PieChart } from 'lucide-react'
import Header from '@/components/layout/Header'
import NetWorthCard from '@/components/dashboard/NetWorthCard'
import StatsRow from '@/components/dashboard/StatsRow'
import NetWorthChart from '@/components/dashboard/NetWorthChart'
import SnapshotManager from '@/components/dashboard/SnapshotManager'
import AllocationDonut from '@/components/dashboard/AllocationDonut'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown'
import GoalTracker from '@/components/dashboard/GoalTracker'
import RecentActivity from '@/components/dashboard/RecentActivity'
import ProjectionSimulator from '@/components/dashboard/ProjectionSimulator'
import KPIIndicators from '@/components/dashboard/KPIIndicators'
import QuestLog from '@/components/dashboard/QuestLog'
import MilestoneTracker from '@/components/dashboard/MilestoneTracker'
import SavingsRate from '@/components/dashboard/SavingsRate'
import ComparisonView from '@/components/dashboard/ComparisonView'
import MonteCarloSimulator from '@/components/dashboard/MonteCarloSimulator'
import { useAssets } from '@/hooks/useAssets'
import { useLiabilities } from '@/hooks/useLiabilities'
import { useSnapshots } from '@/hooks/useSnapshots'
import { useGoal } from '@/hooks/useGoal'

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'projections', label: 'Projections', icon: TrendingUp },
  { id: 'allocation', label: 'Repartition', icon: PieChart },
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

function SystemBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card relative overflow-hidden mb-6 px-5 py-4"
    >
      {/* scanning highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-cyan-400/15 to-transparent animate-[system-scan_5s_linear_infinite]" />
      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400" style={{ boxShadow: '0 0 14px rgba(34,211,238,0.9)' }} />
      <div className="relative flex items-center gap-3">
        <span className="text-cyan-300 text-xl leading-none animate-[system-flicker_4s_linear_infinite]">⟦ ! ⟧</span>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/70">
            Notification du Système
          </p>
          <p className="text-sm font-mono text-white/90 mt-1">
            Bienvenue, <span className="neon-text-cyan">Joueur</span>. Votre statut financier a été synchronisé.
            <span className="ml-1 inline-block w-2 text-cyan-300 animate-[system-blink_1.2s_step-end_infinite]">_</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { assets, totalAssets, isLoading: assetsLoading } = useAssets()
  const { liabilities, totalLiabilities, isLoading: liabilitiesLoading } = useLiabilities()
  const { snapshots, isLoading: snapshotsLoading, upsertSnapshot, deleteSnapshot } = useSnapshots()
  const { goal, isLoading: goalLoading } = useGoal()

  const isLoading = assetsLoading || liabilitiesLoading
  const liveNetWorth = totalAssets - totalLiabilities

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
  const netWorth = latestSnapshot?.net_worth ?? liveNetWorth
  const heroTotalAssets = latestSnapshot?.total_assets ?? totalAssets
  const heroTotalLiabilities = latestSnapshot?.total_liabilities ?? totalLiabilities

  return (
    <>
      <Header title="⟦ FINANCE ⟧" />
      <main className="system-ui flex-1 px-4 md:px-6 py-5 max-w-5xl mx-auto w-full">
        <SystemBanner />

        {/* System menu tabs */}
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
                <motion.div
                  layoutId="tab-glow"
                  className="absolute inset-0 bg-cyan-500/5"
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" {...fadeSlide}>
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
                <motion.div variants={item}>
                  <NetWorthCard netWorth={netWorth} snapshots={snapshots} isLoading={isLoading || snapshotsLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <StatsRow
                    totalAssets={heroTotalAssets}
                    totalLiabilities={heroTotalLiabilities}
                    snapshots={snapshots}
                    isLoading={isLoading || snapshotsLoading}
                  />
                </motion.div>
                <motion.div variants={item}>
                  <KPIIndicators snapshots={snapshots} goal={goal} isLoading={snapshotsLoading || goalLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <GoalTracker netWorth={netWorth} goal={goal} isLoading={goalLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Paliers financiers" subtitle="Vos prochains seuils de patrimoine et le temps estime pour les atteindre" />
                  <MilestoneTracker netWorth={netWorth} snapshots={snapshots} isLoading={isLoading || snapshotsLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Journal de quetes" subtitle="Vos exploits financiers debloques par le Systeme" />
                  <QuestLog netWorth={netWorth} snapshots={snapshots} goal={goal} isLoading={snapshotsLoading || goalLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Evolution du patrimoine" subtitle="Courbe de votre patrimoine net au fil du temps" />
                  <NetWorthChart snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" {...fadeSlide}>
              <motion.div variants={item}>
                <SectionHeader title="Snapshots" subtitle="Historique detaille de chaque mois avec repartition du patrimoine" />
                <SnapshotManager
                  snapshots={snapshots}
                  liabilities={liabilities}
                  isLoading={snapshotsLoading}
                  onSave={upsertSnapshot}
                  onDelete={deleteSnapshot}
                />
              </motion.div>
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.div variants={item}>
                  <SectionHeader title="Comparaison" subtitle="Comparez votre patrimoine mois par mois ou annee par annee" />
                  <ComparisonView snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Epargne mensuelle" subtitle="Variation nette de patrimoine chaque mois" />
                  <SavingsRate snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'projections' && (
            <motion.div key="projections" {...fadeSlide}>
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.div variants={item}>
                  <SectionHeader title="Simulateur de projection" subtitle="Projetez l'evolution de vos actifs sur 1 a 30 ans" />
                  <ProjectionSimulator
                    latestSnapshot={latestSnapshot}
                    totalLiabilities={heroTotalLiabilities}
                    isLoading={isLoading || snapshotsLoading}
                  />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Simulation Monte Carlo" subtitle="1 000 simulations probabilistes pour estimer vos chances d'atteindre vos objectifs" />
                  <MonteCarloSimulator
                    latestSnapshot={latestSnapshot}
                    totalLiabilities={heroTotalLiabilities}
                    isLoading={isLoading || snapshotsLoading}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'allocation' && (
            <motion.div key="allocation" {...fadeSlide}>
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.div variants={item}>
                  <SectionHeader title="Repartition globale" subtitle="Vue d'ensemble de l'allocation de votre patrimoine" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card p-5">
                      <AllocationDonut
                        assets={assets}
                        assetDetails={latestSnapshot?.asset_details}
                        totalAssets={heroTotalAssets}
                        isLoading={isLoading || snapshotsLoading}
                      />
                    </div>
                    <RecentActivity assets={assets} liabilities={liabilities} isLoading={isLoading} />
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Detail par categorie" subtitle="Actifs et passifs ventiles par type" />
                  <CategoryBreakdown
                    assets={assets}
                    liabilities={liabilities}
                    assetDetails={latestSnapshot?.asset_details}
                    liabilityDetails={latestSnapshot?.liability_details}
                    isLoading={isLoading || snapshotsLoading}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}

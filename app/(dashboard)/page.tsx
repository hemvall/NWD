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
      <h2 className="text-sm font-semibold text-white/70">{title}</h2>
      {subtitle && <p className="text-[10px] text-white/30 mt-0.5">{subtitle}</p>}
    </div>
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
      <Header title="Dashboard" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-5xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-white/35 hover:text-white/60 border border-transparent hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="tab-glow"
                  className="absolute inset-0 rounded-xl bg-cyan-500/5"
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
                />
              )}
            </button>
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
                  <SectionHeader title="Evolution du patrimoine" subtitle="Courbe de votre patrimoine net au fil du temps" />
                  <NetWorthChart snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" {...fadeSlide}>
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                <motion.div variants={item}>
                  <SectionHeader title="Comparaison" subtitle="Comparez votre patrimoine mois par mois ou annee par annee" />
                  <ComparisonView snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
                <motion.div variants={item}>
                  <SectionHeader title="Epargne mensuelle" subtitle="Variation nette de patrimoine chaque mois" />
                  <SavingsRate snapshots={snapshots} isLoading={snapshotsLoading} />
                </motion.div>
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

'use client'

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

export default function DashboardPage() {
  const { assets, totalAssets, isLoading: assetsLoading } = useAssets()
  const { liabilities, totalLiabilities, isLoading: liabilitiesLoading } = useLiabilities()
  const { snapshots, isLoading: snapshotsLoading, upsertSnapshot, deleteSnapshot } = useSnapshots()
  const { goal, isLoading: goalLoading } = useGoal()

  const isLoading = assetsLoading || liabilitiesLoading
  const liveNetWorth = totalAssets - totalLiabilities

  // Use the latest snapshot as the source of truth for the hero and goal tracker.
  // Fall back to live calculation only when no snapshots exist.
  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
  const netWorth = latestSnapshot?.net_worth ?? liveNetWorth
  const heroTotalAssets = latestSnapshot?.total_assets ?? totalAssets
  const heroTotalLiabilities = latestSnapshot?.total_liabilities ?? totalLiabilities

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 px-4 md:px-6 py-5 space-y-4 max-w-5xl mx-auto w-full">
        <NetWorthCard netWorth={netWorth} snapshots={snapshots} isLoading={isLoading || snapshotsLoading} />
        <StatsRow
          totalAssets={heroTotalAssets}
          totalLiabilities={heroTotalLiabilities}
          snapshots={snapshots}
          isLoading={isLoading || snapshotsLoading}
        />
        <KPIIndicators snapshots={snapshots} goal={goal} isLoading={snapshotsLoading || goalLoading} />
        <GoalTracker netWorth={netWorth} goal={goal} isLoading={goalLoading} />
        <NetWorthChart snapshots={snapshots} isLoading={snapshotsLoading} />
        <ComparisonView snapshots={snapshots} isLoading={snapshotsLoading} />
        <SavingsRate snapshots={snapshots} isLoading={snapshotsLoading} />
        <ProjectionSimulator
          latestSnapshot={latestSnapshot}
          totalLiabilities={heroTotalLiabilities}
          isLoading={isLoading || snapshotsLoading}
        />
        <MonteCarloSimulator
          latestSnapshot={latestSnapshot}
          totalLiabilities={heroTotalLiabilities}
          isLoading={isLoading || snapshotsLoading}
        />
        <SnapshotManager
          snapshots={snapshots}
          liabilities={liabilities}
          isLoading={snapshotsLoading}
          onSave={upsertSnapshot}
          onDelete={deleteSnapshot}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <AllocationDonut
            assets={assets}
            assetDetails={latestSnapshot?.asset_details}
            totalAssets={heroTotalAssets}
            isLoading={isLoading || snapshotsLoading}
          />
          <RecentActivity assets={assets} liabilities={liabilities} isLoading={isLoading} />
        </div>
        <CategoryBreakdown
          assets={assets}
          liabilities={liabilities}
          assetDetails={latestSnapshot?.asset_details}
          liabilityDetails={latestSnapshot?.liability_details}
          isLoading={isLoading || snapshotsLoading}
        />
      </main>
    </>
  )
}

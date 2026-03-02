'use client'

import Header from '@/components/layout/Header'
import LiabilityTable from '@/components/liabilities/LiabilityTable'
import { useLiabilities } from '@/hooks/useLiabilities'

export default function LiabilitiesPage() {
  const { liabilities, totalLiabilities, isLoading, addLiability, updateLiability, deleteLiability } = useLiabilities()

  return (
    <>
      <Header title="Liabilities" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full">
        <LiabilityTable
          liabilities={liabilities}
          isLoading={isLoading}
          onAdd={addLiability}
          onUpdate={updateLiability}
          onDelete={deleteLiability}
          totalLiabilities={totalLiabilities}
        />
      </main>
    </>
  )
}

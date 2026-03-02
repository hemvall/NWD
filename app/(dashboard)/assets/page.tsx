'use client'

import Header from '@/components/layout/Header'
import AssetTable from '@/components/assets/AssetTable'
import { useAssets } from '@/hooks/useAssets'

export default function AssetsPage() {
  const { assets, totalAssets, isLoading, addAsset, updateAsset, deleteAsset } = useAssets()

  return (
    <>
      <Header title="Assets" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full">
        <AssetTable
          assets={assets}
          isLoading={isLoading}
          onAdd={addAsset}
          onUpdate={updateAsset}
          onDelete={deleteAsset}
          totalAssets={totalAssets}
        />
      </main>
    </>
  )
}

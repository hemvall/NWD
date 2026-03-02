'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ASSET_CATEGORIES, CHART_COLORS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Asset, AssetDetails } from '@/lib/types'

const DETAIL_TO_ASSET_CATEGORY: Record<keyof AssetDetails, keyof typeof ASSET_CATEGORIES> = {
  immobilier:    'real_estate',
  cto:           'stocks',
  livrets:       'cash',
  cryptos:       'crypto',
  voiture:       'other',
  montres:       'collection',
  cartesPokemon: 'collection',
  jeuxPokemon:   'collection',
  autres:        'other',
}

interface Props {
  assets: Asset[]
  assetDetails?: AssetDetails | null
  totalAssets: number
  isLoading: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percent: number } }[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: { percent } } = payload[0]
  return (
    <div className="bg-white dark:bg-[#0b1830] border border-slate-200 dark:border-slate-600/50 rounded-xl px-3 py-2.5 shadow-lg text-sm">
      <p className="text-slate-600 dark:text-slate-300 font-medium mb-0.5">{name}</p>
      <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(value)}</p>
      <p className="text-slate-400 dark:text-slate-500 text-xs">{(percent * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function AllocationDonut({ assets, assetDetails, totalAssets, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700/60 rounded mb-4" />
        <div className="h-48 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
      </div>
    )
  }

  // Build category totals — prefer snapshot details, fall back to live assets
  let categoryTotals: Partial<Record<keyof typeof ASSET_CATEGORIES, number>>
  if (assetDetails) {
    categoryTotals = {}
    for (const [field, cat] of Object.entries(DETAIL_TO_ASSET_CATEGORY) as [keyof AssetDetails, keyof typeof ASSET_CATEGORIES][]) {
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + (assetDetails[field] ?? 0)
    }
  } else {
    categoryTotals = {}
    for (const asset of assets) {
      const cat = asset.category as keyof typeof ASSET_CATEGORIES
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + asset.value
    }
  }

  const data = Object.entries(ASSET_CATEGORIES)
    .map(([key, meta], i) => ({
      name: meta.label,
      value: categoryTotals[key as keyof typeof ASSET_CATEGORIES] ?? 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Asset Allocation</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
          No data yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Asset Allocation</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(totalAssets, true)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">total</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-3">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-slate-600 dark:text-slate-400">{name}</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(value, true)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

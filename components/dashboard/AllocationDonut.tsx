'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ASSET_CATEGORIES, CHART_COLORS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Asset, AssetDetails } from '@/lib/types'

const DETAIL_TO_ASSET_CATEGORY: Record<keyof AssetDetails, keyof typeof ASSET_CATEGORIES> = {
  immobilier: 'real_estate', cto: 'stocks', livrets: 'cash', cryptos: 'crypto',
  voiture: 'other', montres: 'collection', cartesPokemon: 'collection',
  jeuxPokemon: 'collection', autres: 'other',
}

// Neon-ish colors for web3 vibe
const NEON_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#818cf8', '#fb923c']

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
    <div className="glass-card px-3 py-2.5 shadow-xl text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/50 font-medium mb-0.5">{name}</p>
      <p className="font-bold font-mono neon-text-cyan">{formatCurrency(value)}</p>
      <p className="text-white/30 text-xs">{(percent * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function AllocationDonut({ assets, assetDetails, totalAssets, isLoading }: Props) {
  if (isLoading) return <div className="h-48 glass-inner animate-pulse rounded-xl" />

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
      color: NEON_COLORS[i % NEON_COLORS.length],
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/20 text-sm glass-inner rounded-xl">
        Pas de donnees
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold font-mono neon-text-cyan">{formatCurrency(totalAssets, true)}</span>
          <span className="text-[10px] text-white/30">total</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-3">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}60` }} />
            <span className="text-white/40">{name}</span>
            <span className="font-semibold font-mono text-white/60">{formatCurrency(value, true)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES, CHART_COLORS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Asset, Liability, AssetDetails, LiabilityDetails } from '@/lib/types'

// Maps AssetDetails snapshot fields → ASSET_CATEGORIES keys
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

// Maps LiabilityDetails snapshot fields → LIABILITY_CATEGORIES keys
const DETAIL_TO_LIABILITY_CATEGORY: Record<keyof LiabilityDetails, keyof typeof LIABILITY_CATEGORIES> = {
  creditImmobilier:   'mortgage',
  creditConsommation: 'personal',
  cartesCredit:       'credit_card',
  autres:             'other',
}

interface Props {
  assets: Asset[]
  liabilities: Liability[]
  assetDetails?: AssetDetails | null
  liabilityDetails?: LiabilityDetails | null
  isLoading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0b1830] border border-slate-200 dark:border-slate-600/50 rounded-xl px-3 py-2.5 shadow-lg text-sm">
      <p className="text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function CategoryBreakdown({ assets, liabilities, assetDetails, liabilityDetails, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700/60 rounded mb-4" />
        <div className="h-48 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
      </div>
    )
  }

  // Build asset totals per category — prefer snapshot details, fall back to live assets
  let assetData: { name: string; value: number; color: string }[]
  if (assetDetails) {
    const totals: Partial<Record<keyof typeof ASSET_CATEGORIES, number>> = {}
    for (const [field, cat] of Object.entries(DETAIL_TO_ASSET_CATEGORY) as [keyof AssetDetails, keyof typeof ASSET_CATEGORIES][]) {
      totals[cat] = (totals[cat] ?? 0) + (assetDetails[field] ?? 0)
    }
    assetData = Object.entries(ASSET_CATEGORIES).map(([key, meta], i) => ({
      name: meta.label,
      value: totals[key as keyof typeof ASSET_CATEGORIES] ?? 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  } else {
    assetData = Object.entries(ASSET_CATEGORIES).map(([key, meta], i) => {
      const total = assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0)
      return { name: meta.label, value: total, color: CHART_COLORS[i % CHART_COLORS.length] }
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  }

  // Build liability totals per category — prefer snapshot details, fall back to live liabilities
  let liabilityData: { name: string; value: number; color: string }[]
  if (liabilityDetails) {
    const totals: Partial<Record<keyof typeof LIABILITY_CATEGORIES, number>> = {}
    for (const [field, cat] of Object.entries(DETAIL_TO_LIABILITY_CATEGORY) as [keyof LiabilityDetails, keyof typeof LIABILITY_CATEGORIES][]) {
      totals[cat] = (totals[cat] ?? 0) + (liabilityDetails[field] ?? 0)
    }
    liabilityData = Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => ({
      name: meta.label,
      value: totals[key as keyof typeof LIABILITY_CATEGORIES] ?? 0,
      color: '#ef4444',
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  } else {
    liabilityData = Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => {
      const total = liabilities.filter(l => l.category === key).reduce((s, l) => s + l.value, 0)
      return { name: meta.label, value: total, color: '#ef4444' }
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  }

  const isEmpty = assetData.length === 0 && liabilityData.length === 0

  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Category Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
          No data yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Asset Categories</h3>
      {assetData.length > 0 && (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={assetData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" />
            <XAxis type="number" tickFormatter={v => formatCurrency(v, true)} tick={{ fontSize: 10 }} className="text-slate-500 dark:text-slate-400" axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} className="text-slate-500 dark:text-slate-400" axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {assetData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      {liabilityData.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 mt-5">Liability Categories</h3>
          <ResponsiveContainer width="100%" height={Math.max(60, liabilityData.length * 38)}>
            <BarChart data={liabilityData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" />
              <XAxis type="number" tickFormatter={v => formatCurrency(v, true)} tick={{ fontSize: 10 }} className="text-slate-500 dark:text-slate-400" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} className="text-slate-500 dark:text-slate-400" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#ef4444" maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}

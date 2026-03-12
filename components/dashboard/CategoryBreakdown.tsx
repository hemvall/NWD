'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Asset, Liability, AssetDetails, LiabilityDetails } from '@/lib/types'

const DETAIL_TO_ASSET_CATEGORY: Record<keyof AssetDetails, keyof typeof ASSET_CATEGORIES> = {
  immobilier: 'real_estate', cto: 'stocks', livrets: 'cash', cryptos: 'crypto',
  voiture: 'other', montres: 'collection', cartesPokemon: 'collection',
  jeuxPokemon: 'collection', autres: 'other',
}

const DETAIL_TO_LIABILITY_CATEGORY: Record<keyof LiabilityDetails, keyof typeof LIABILITY_CATEGORIES> = {
  creditImmobilier: 'mortgage', creditConsommation: 'personal',
  cartesCredit: 'credit_card', autres: 'other',
}

const NEON_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#818cf8', '#fb923c']

interface Props {
  assets: Asset[]; liabilities: Liability[]
  assetDetails?: AssetDetails | null; liabilityDetails?: LiabilityDetails | null
  isLoading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 shadow-xl text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/40 mb-0.5">{label}</p>
      <p className="font-bold font-mono neon-text-cyan">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function CategoryBreakdown({ assets, liabilities, assetDetails, liabilityDetails, isLoading }: Props) {
  if (isLoading) return <div className="h-48 glass-inner animate-pulse rounded-xl" />

  let assetData: { name: string; value: number; color: string }[]
  if (assetDetails) {
    const totals: Partial<Record<keyof typeof ASSET_CATEGORIES, number>> = {}
    for (const [field, cat] of Object.entries(DETAIL_TO_ASSET_CATEGORY) as [keyof AssetDetails, keyof typeof ASSET_CATEGORIES][]) {
      totals[cat] = (totals[cat] ?? 0) + (assetDetails[field] ?? 0)
    }
    assetData = Object.entries(ASSET_CATEGORIES).map(([key, meta], i) => ({
      name: meta.label, value: totals[key as keyof typeof ASSET_CATEGORIES] ?? 0,
      color: NEON_COLORS[i % NEON_COLORS.length],
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  } else {
    assetData = Object.entries(ASSET_CATEGORIES).map(([key, meta], i) => {
      const total = assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0)
      return { name: meta.label, value: total, color: NEON_COLORS[i % NEON_COLORS.length] }
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  }

  let liabilityData: { name: string; value: number; color: string }[]
  if (liabilityDetails) {
    const totals: Partial<Record<keyof typeof LIABILITY_CATEGORIES, number>> = {}
    for (const [field, cat] of Object.entries(DETAIL_TO_LIABILITY_CATEGORY) as [keyof LiabilityDetails, keyof typeof LIABILITY_CATEGORIES][]) {
      totals[cat] = (totals[cat] ?? 0) + (liabilityDetails[field] ?? 0)
    }
    liabilityData = Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => ({
      name: meta.label, value: totals[key as keyof typeof LIABILITY_CATEGORIES] ?? 0, color: '#f472b6',
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  } else {
    liabilityData = Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => {
      const total = liabilities.filter(l => l.category === key).reduce((s, l) => s + l.value, 0)
      return { name: meta.label, value: total, color: '#f472b6' }
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  }

  const isEmpty = assetData.length === 0 && liabilityData.length === 0
  if (isEmpty) {
    return <div className="flex items-center justify-center h-48 text-white/20 text-sm glass-inner rounded-xl">Pas de donnees</div>
  }

  return (
    <div>
      {assetData.length > 0 && (
        <div className="glass-inner rounded-xl p-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Assets par categorie</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={assetData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tickFormatter={v => formatCurrency(v, true)} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {assetData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {liabilityData.length > 0 && (
        <div className="glass-inner rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Passifs par categorie</p>
          <ResponsiveContainer width="100%" height={Math.max(60, liabilityData.length * 38)}>
            <BarChart data={liabilityData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tickFormatter={v => formatCurrency(v, true)} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#f472b6" maxBarSize={18} style={{ filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.3))' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

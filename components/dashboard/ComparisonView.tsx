'use client'

import { useState, useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

type CompareMode = 'mom' | 'yoy'

interface ComparisonRow {
  label: string
  currentValue: number
  previousValue: number
  delta: number
  deltaPct: number | null
}

function buildRows(current: NetWorthSnapshot, previous: NetWorthSnapshot): ComparisonRow[] {
  const rows: ComparisonRow[] = []

  rows.push({
    label: 'Patrimoine net',
    currentValue: current.net_worth,
    previousValue: previous.net_worth,
    delta: current.net_worth - previous.net_worth,
    deltaPct: previous.net_worth !== 0 ? ((current.net_worth - previous.net_worth) / Math.abs(previous.net_worth)) * 100 : null,
  })
  rows.push({
    label: 'Total actifs',
    currentValue: current.total_assets,
    previousValue: previous.total_assets,
    delta: current.total_assets - previous.total_assets,
    deltaPct: previous.total_assets !== 0 ? ((current.total_assets - previous.total_assets) / previous.total_assets) * 100 : null,
  })
  rows.push({
    label: 'Total passifs',
    currentValue: current.total_liabilities,
    previousValue: previous.total_liabilities,
    delta: current.total_liabilities - previous.total_liabilities,
    deltaPct: previous.total_liabilities !== 0 ? ((current.total_liabilities - previous.total_liabilities) / previous.total_liabilities) * 100 : null,
  })

  if (current.asset_details && previous.asset_details) {
    const assetKeys: Array<{ key: keyof NonNullable<NetWorthSnapshot['asset_details']>; label: string }> = [
      { key: 'immobilier', label: 'Immobilier' },
      { key: 'cto', label: 'CTO' },
      { key: 'livrets', label: 'Livrets' },
      { key: 'cryptos', label: 'Cryptos' },
      { key: 'voiture', label: 'Voiture' },
      { key: 'montres', label: 'Montres' },
      { key: 'cartesPokemon', label: 'Cartes Pokemon' },
      { key: 'jeuxPokemon', label: 'Jeux Pokemon' },
      { key: 'autres', label: 'Autres actifs' },
    ]
    for (const { key, label } of assetKeys) {
      const cv = current.asset_details[key] ?? 0
      const pv = previous.asset_details[key] ?? 0
      if (cv === 0 && pv === 0) continue
      rows.push({
        label,
        currentValue: cv,
        previousValue: pv,
        delta: cv - pv,
        deltaPct: pv !== 0 ? ((cv - pv) / pv) * 100 : null,
      })
    }
  }

  return rows
}

function DeltaCell({ delta, deltaPct }: { delta: number; deltaPct: number | null }) {
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  const colorClass = delta > 0 ? 'neon-text-green' : delta < 0 ? 'neon-text-pink' : 'text-white/30'

  return (
    <div className="flex items-center justify-end gap-1">
      <Icon className={`h-3 w-3 ${colorClass}`} />
      <span className={`text-xs font-semibold font-mono ${colorClass}`}>
        {delta > 0 ? '+' : ''}{formatCurrency(delta)}
      </span>
      {deltaPct !== null && (
        <span className={`text-[10px] ${colorClass} opacity-70`}>
          ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
        </span>
      )}
    </div>
  )
}

export default function ComparisonView({ snapshots, isLoading }: Props) {
  const [mode, setMode] = useState<CompareMode>('mom')

  const { current, previous, currentLabel, previousLabel } = useMemo(() => {
    if (snapshots.length < 2) return { current: null, previous: null, currentLabel: '', previousLabel: '' }

    const latest = snapshots[snapshots.length - 1]
    const latestDate = new Date(latest.snapshot_date)

    if (mode === 'mom') {
      const prev = snapshots[snapshots.length - 2]
      return {
        current: latest,
        previous: prev,
        currentLabel: format(latestDate, 'MMM yyyy'),
        previousLabel: format(new Date(prev.snapshot_date), 'MMM yyyy'),
      }
    }

    const targetYear = latestDate.getFullYear() - 1
    const targetMonth = latestDate.getMonth()
    let bestMatch: NetWorthSnapshot | null = null
    let bestDiff = Infinity
    for (const s of snapshots) {
      if (s.id === latest.id) continue
      const d = new Date(s.snapshot_date)
      const diff = Math.abs((d.getFullYear() - targetYear) * 12 + d.getMonth() - targetMonth)
      if (diff < bestDiff) {
        bestDiff = diff
        bestMatch = s
      }
    }

    if (!bestMatch || bestDiff > 2) bestMatch = snapshots[0]

    return {
      current: latest,
      previous: bestMatch,
      currentLabel: format(latestDate, 'MMM yyyy'),
      previousLabel: format(new Date(bestMatch.snapshot_date), 'MMM yyyy'),
    }
  }, [snapshots, mode])

  const rows = useMemo(() => {
    if (!current || !previous) return []
    return buildRows(current, previous)
  }, [current, previous])

  if (isLoading) {
    return <div className="h-40 glass-inner animate-pulse rounded-xl" />
  }

  if (snapshots.length < 2) {
    return (
      <div className="flex items-center justify-center h-20 text-white/20 text-xs glass-inner rounded-xl">
        Ajoutez au moins 2 snapshots pour comparer
      </div>
    )
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        {(['mom', 'yoy'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === m
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : 'text-white/30 hover:text-white/50 border border-transparent'
            }`}
          >
            {m === 'mom' ? 'Mois / Mois' : 'Annee / Annee'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto glass-inner rounded-xl p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 pr-3 text-white/30 font-medium" />
              <th className="text-right py-2 px-3 text-white/30 font-medium">{previousLabel}</th>
              <th className="text-right py-2 px-3 text-white/30 font-medium">{currentLabel}</th>
              <th className="text-right py-2 pl-3 text-white/30 font-medium">Variation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={`border-b border-white/[0.03] ${i === 0 ? 'bg-cyan-500/5' : ''}`}
              >
                <td className={`py-2 pr-3 ${i === 0 ? 'font-semibold text-white/80' : 'font-medium pl-3 text-white/50'}`}>
                  {row.label}
                </td>
                <td className="py-2 px-3 text-right text-white/30 font-mono">{formatCurrency(row.previousValue)}</td>
                <td className="py-2 px-3 text-right text-white/60 font-mono font-medium">{formatCurrency(row.currentValue)}</td>
                <td className="py-2 pl-3">
                  <DeltaCell delta={row.delta} deltaPct={row.deltaPct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

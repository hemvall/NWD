'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SnapshotDialog from './SnapshotDialog'
import type { NetWorthSnapshot, AssetDetails, LiabilityDetails, Liability } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  snapshots: NetWorthSnapshot[]
  liabilities: Liability[]
  isLoading: boolean
  onSave: (date: string, totalAssets: number, totalLiabilities: number, assetDetails: AssetDetails, liabilityDetails: LiabilityDetails) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const ASSET_LABELS: { key: keyof AssetDetails; label: string }[] = [
  { key: 'cto',           label: 'CTO' },
  { key: 'livrets',       label: 'Livrets' },
  { key: 'cryptos',       label: 'Cryptos' },
  { key: 'voiture',       label: 'Voiture' },
  { key: 'montres',       label: 'Montres' },
  { key: 'cartesPokemon', label: 'Pokémon cartes' },
  { key: 'jeuxPokemon',   label: 'Pokémon jeux' },
  { key: 'autres',        label: 'Autres' },
]

const LIABILITY_LABELS: { key: keyof LiabilityDetails; label: string }[] = [
  { key: 'creditImmobilier',  label: 'Crédit immo' },
  { key: 'creditConsommation',label: 'Crédit conso' },
  { key: 'cartesCredit',      label: 'Cartes crédit' },
  { key: 'autres',            label: 'Autres passifs' },
]

export default function SnapshotManager({ snapshots, liabilities, isLoading, onSave, onDelete }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NetWorthSnapshot | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(snapshot: NetWorthSnapshot) {
    setEditing(snapshot)
    setDialogOpen(true)
  }

  async function handleDelete(snapshot: NetWorthSnapshot) {
    if (!confirm(`Delete snapshot for ${format(new Date(snapshot.snapshot_date), 'MMMM yyyy')}?`)) return
    setDeletingId(snapshot.id)
    try {
      await onDelete(snapshot.id)
    } finally {
      setDeletingId(null)
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const sorted = [...snapshots].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700/60 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Net Worth History</h3>
          <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            Add month
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <p className="text-sm text-slate-400 dark:text-slate-500">No snapshots yet.</p>
            <Button size="sm" variant="outline" onClick={openAdd} className="gap-1.5 text-xs mt-1">
              <Plus className="h-3.5 w-3.5" />
              Add your first month
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {sorted.map(snap => {
              const label = format(new Date(snap.snapshot_date), 'MMMM yyyy')
              const isDeleting = deletingId === snap.id
              const isExpanded = expandedId === snap.id
              const hasDetails = !!snap.asset_details || !!snap.liability_details

              return (
                <div key={snap.id} className="py-3 first:pt-0 last:pb-0">
                  {/* Ligne principale */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left"
                      onClick={() => hasDetails && toggleExpand(snap.id)}
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        {label}
                        {hasDetails && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatCurrency(snap.total_assets)} assets · {formatCurrency(snap.total_liabilities)} liabilities
                      </p>
                    </button>
                    <span className={`text-sm font-semibold tabular-nums ${snap.net_worth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {formatCurrency(snap.net_worth)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        onClick={() => openEdit(snap)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => handleDelete(snap)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Détail expandable */}
                  {isExpanded && (
                    <div className="mt-2.5 pl-0 space-y-2">
                      {snap.asset_details && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Assets</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ASSET_LABELS.filter(({ key }) => (snap.asset_details![key] ?? 0) > 0).map(({ key, label }) => (
                              <span key={key} className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md px-2 py-0.5">
                                <span className="text-emerald-500/70 dark:text-emerald-400/60">{label}</span>
                                {formatCurrency(snap.asset_details![key]!)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {snap.liability_details && (snap.liability_details.creditImmobilier > 0 || snap.liability_details.creditConsommation > 0 || snap.liability_details.cartesCredit > 0 || snap.liability_details.autres > 0) && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Liabilities</p>
                          <div className="flex flex-wrap gap-1.5">
                            {LIABILITY_LABELS.filter(({ key }) => (snap.liability_details![key] ?? 0) > 0).map(({ key, label }) => (
                              <span key={key} className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md px-2 py-0.5">
                                <span className="text-red-400/70">{label}</span>
                                {formatCurrency(snap.liability_details![key]!)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SnapshotDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={onSave}
        initial={editing}
        liabilities={liabilities}
        snapshots={snapshots}
      />
    </>
  )
}

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
  { key: 'cto', label: 'CTO' }, { key: 'livrets', label: 'Livrets' },
  { key: 'cryptos', label: 'Cryptos' }, { key: 'voiture', label: 'Voiture' },
  { key: 'montres', label: 'Montres' }, { key: 'cartesPokemon', label: 'Pokemon cartes' },
  { key: 'jeuxPokemon', label: 'Pokemon jeux' }, { key: 'autres', label: 'Autres' },
]

const LIABILITY_LABELS: { key: keyof LiabilityDetails; label: string }[] = [
  { key: 'creditImmobilier', label: 'Credit immo' }, { key: 'creditConsommation', label: 'Credit conso' },
  { key: 'cartesCredit', label: 'Cartes credit' }, { key: 'autres', label: 'Autres passifs' },
]

export default function SnapshotManager({ snapshots, liabilities, isLoading, onSave, onDelete }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NetWorthSnapshot | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openAdd() { setEditing(null); setDialogOpen(true) }
  function openEdit(snapshot: NetWorthSnapshot) { setEditing(snapshot); setDialogOpen(true) }

  async function handleDelete(snapshot: NetWorthSnapshot) {
    if (!confirm(`Supprimer le snapshot ${format(new Date(snapshot.snapshot_date), 'MMMM yyyy')} ?`)) return
    setDeletingId(snapshot.id)
    try { await onDelete(snapshot.id) } finally { setDeletingId(null) }
  }

  function toggleExpand(id: string) { setExpandedId(prev => prev === id ? null : id) }

  const sorted = [...snapshots].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-12 glass-inner animate-pulse rounded-xl" />)}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-white/30">Historique</span>
        <Button size="sm" variant="outline" onClick={openAdd}
          className="gap-1.5 text-xs h-7 bg-white/[0.03] border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.06]">
          <Plus className="h-3 w-3" /> Ajouter
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2 glass-inner rounded-xl">
          <p className="text-sm text-white/20">Aucun snapshot</p>
          <Button size="sm" variant="outline" onClick={openAdd}
            className="gap-1.5 text-xs bg-white/[0.03] border-white/[0.06] text-white/60 hover:text-white">
            <Plus className="h-3 w-3" /> Premier snapshot
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {sorted.map(snap => {
            const label = format(new Date(snap.snapshot_date), 'MMMM yyyy')
            const isDeleting = deletingId === snap.id
            const isExpanded = expandedId === snap.id
            const hasDetails = !!snap.asset_details || !!snap.liability_details

            return (
              <div key={snap.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => hasDetails && toggleExpand(snap.id)}>
                    <p className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                      {label}
                      {hasDetails && <span className="text-[10px] text-white/20">{isExpanded ? '▲' : '▼'}</span>}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5 font-mono">
                      {formatCurrency(snap.total_assets)} A &middot; {formatCurrency(snap.total_liabilities)} L
                    </p>
                  </button>
                  <span className={`text-sm font-semibold font-mono tabular-nums ${snap.net_worth >= 0 ? 'neon-text-green' : 'neon-text-pink'}`}>
                    {formatCurrency(snap.net_worth)}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white/20 hover:text-white/60" onClick={() => openEdit(snap)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white/20 hover:text-red-400" onClick={() => handleDelete(snap)} disabled={isDeleting}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 pl-0 space-y-2">
                    {snap.asset_details && (
                      <div>
                        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wide mb-1">Assets</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ASSET_LABELS.filter(({ key }) => (snap.asset_details![key] ?? 0) > 0).map(({ key, label }) => (
                            <span key={key} className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 rounded-md px-2 py-0.5 font-mono">
                              <span className="text-emerald-500/50">{label}</span>
                              {formatCurrency(snap.asset_details![key]!)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {snap.liability_details && (snap.liability_details.creditImmobilier > 0 || snap.liability_details.creditConsommation > 0 || snap.liability_details.cartesCredit > 0 || snap.liability_details.autres > 0) && (
                      <div>
                        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wide mb-1">Liabilities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {LIABILITY_LABELS.filter(({ key }) => (snap.liability_details![key] ?? 0) > 0).map(({ key, label }) => (
                            <span key={key} className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-300 rounded-md px-2 py-0.5 font-mono">
                              <span className="text-red-400/50">{label}</span>
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

      <SnapshotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={onSave} initial={editing} liabilities={liabilities} snapshots={snapshots} />
    </>
  )
}

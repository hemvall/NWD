'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
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

const NEON_COLORS: Record<string, string> = {
  Crypto: '#a78bfa',
  Stocks: '#22d3ee',
  Livrets: '#34d399',
  Montres: '#fbbf24',
  Voiture: '#fb923c',
  Collection: '#f472b6',
  Immobilier: '#818cf8',
  Autres: '#6b7280',
}

const LIABILITY_LABELS: { key: keyof LiabilityDetails; label: string }[] = [
  { key: 'creditImmobilier', label: 'Credit immo' }, { key: 'creditConsommation', label: 'Credit conso' },
  { key: 'cartesCredit', label: 'Cartes credit' }, { key: 'autres', label: 'Autres passifs' },
]

function buildDonutData(details: AssetDetails) {
  const grouped: { name: string; value: number }[] = [
    { name: 'Crypto', value: details.cryptos ?? 0 },
    { name: 'Stocks', value: details.cto ?? 0 },
    { name: 'Livrets', value: details.livrets ?? 0 },
    { name: 'Montres', value: details.montres ?? 0 },
    { name: 'Voiture', value: details.voiture ?? 0 },
    { name: 'Collection', value: (details.cartesPokemon ?? 0) + (details.jeuxPokemon ?? 0) },
    { name: 'Immobilier', value: details.immobilier ?? 0 },
    { name: 'Autres', value: details.autres ?? 0 },
  ]
  return grouped.filter(d => d.value > 0).sort((a, b) => b.value - a.value)
}

function MiniDonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percent: number } }[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: { percent } } = payload[0]
  return (
    <div className="glass-card px-2.5 py-2 shadow-xl text-xs !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/50 font-medium">{name}</p>
      <p className="font-bold font-mono neon-text-cyan">{formatCurrency(value)}</p>
      <p className="text-white/30">{(percent * 100).toFixed(1)}%</p>
    </div>
  )
}

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
            const donutData = snap.asset_details ? buildDonutData(snap.asset_details) : []
            const totalAssets = snap.total_assets

            return (
              <div key={snap.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => hasDetails && toggleExpand(snap.id)}>
                    <p className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                      {label}
                      {hasDetails && (
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex"
                        >
                          <ChevronDown className="h-3 w-3 text-white/20" />
                        </motion.span>
                      )}
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

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 glass-inner rounded-xl p-4">
                        {/* Donut chart + legend */}
                        {donutData.length > 0 && (
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                              className="relative shrink-0"
                              style={{ width: 150, height: 150 }}
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={donutData}
                                    cx="50%" cy="50%"
                                    innerRadius={42} outerRadius={62}
                                    paddingAngle={2}
                                    dataKey="value"
                                    strokeWidth={0}
                                    animationBegin={0}
                                    animationDuration={600}
                                    animationEasing="ease-out"
                                  >
                                    {donutData.map((entry, index) => (
                                      <Cell key={index} fill={NEON_COLORS[entry.name] ?? '#6b7280'} style={{ filter: `drop-shadow(0 0 6px ${NEON_COLORS[entry.name] ?? '#6b7280'}50)` }} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<MiniDonutTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold font-mono neon-text-cyan">{formatCurrency(totalAssets, true)}</span>
                                <span className="text-[8px] text-white/25">patrimoine</span>
                              </div>
                            </motion.div>

                            <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2">
                              {donutData.map(({ name, value }, i) => {
                                const pct = totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) : '0'
                                return (
                                  <motion.div
                                    key={name}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
                                    className="flex items-center gap-2 text-[11px]"
                                  >
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: NEON_COLORS[name], boxShadow: `0 0 6px ${NEON_COLORS[name]}60` }} />
                                    <span className="text-white/45 truncate">{name}</span>
                                    <span className="font-semibold font-mono text-white/65 ml-auto">{formatCurrency(value, true)}</span>
                                    <span className="text-white/25 font-mono w-10 text-right">{pct}%</span>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Liabilities row */}
                        {snap.liability_details && (snap.liability_details.creditImmobilier > 0 || snap.liability_details.creditConsommation > 0 || snap.liability_details.cartesCredit > 0 || snap.liability_details.autres > 0) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={donutData.length > 0 ? 'mt-3 pt-3 border-t border-white/[0.06]' : ''}
                          >
                            <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wide mb-1.5">Passifs</p>
                            <div className="flex flex-wrap gap-1.5">
                              {LIABILITY_LABELS.filter(({ key }) => (snap.liability_details![key] ?? 0) > 0).map(({ key, label }) => (
                                <span key={key} className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-300 rounded-md px-2 py-0.5 font-mono">
                                  <span className="text-red-400/50">{label}</span>
                                  {formatCurrency(snap.liability_details![key]!)}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      <SnapshotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={onSave} initial={editing} liabilities={liabilities} snapshots={snapshots} />
    </>
  )
}

'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LIABILITY_CATEGORIES } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import LiabilityDialog from './LiabilityDialog'
import { computeMortgage, parseMortgageNotes, formatMonthsLeft } from '@/lib/mortgage'
import type { Liability, LiabilityFormData } from '@/lib/types'

interface Props {
  liabilities: Liability[]
  isLoading: boolean
  onAdd: (data: LiabilityFormData) => Promise<void>
  onUpdate: (id: string, data: Partial<LiabilityFormData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  totalLiabilities: number
}

export default function LiabilityTable({ liabilities, isLoading, onAdd, onUpdate, onDelete, totalLiabilities }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Liability | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openAdd() { setEditing(null); setDialogOpen(true) }
  function openEdit(l: Liability) { setEditing(l); setDialogOpen(true) }

  async function handleSave(data: LiabilityFormData) {
    if (editing) await onUpdate(editing.id, data)
    else await onAdd(data)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try { await onDelete(id) } finally { setDeletingId(null) }
  }

  const grouped = Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => ({
    key, meta,
    items: liabilities.filter(l => l.category === key),
    total: liabilities.filter(l => l.category === key).reduce((s, l) => s + l.value, 0),
  })).filter(g => g.items.length > 0)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-[#0b1526] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalLiabilities)}</p>
        </div>
        <Button onClick={openAdd} size="sm" variant="destructive" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Liability
        </Button>
      </div>

      {liabilities.length === 0 ? (
        <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-dashed border-slate-300 dark:border-slate-600/50 p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-3">No liabilities yet</p>
          <Button onClick={openAdd} variant="outline" size="sm">Add your first liability</Button>
        </div>
      ) : (
        grouped.map(({ key, meta, items, total }) => {
          const Icon = meta.icon
          return (
            <div key={key} className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <div className={cn('flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/40', meta.bgColor)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', meta.textColor)} />
                  <span className={cn('text-sm font-semibold', meta.textColor)}>{meta.label}</span>
                </div>
                <Badge variant="secondary" className={cn('text-xs font-semibold', meta.textColor, meta.bgColor)}>
                  {formatCurrency(total)}
                </Badge>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {items.map(item => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                      {(() => {
                        const mtg = parseMortgageNotes(item.notes)
                        if (mtg) {
                          const r = computeMortgage(mtg)
                          return (
                            <div className="mt-0.5">
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {formatCurrency(r.monthly)}/mois · {formatMonthsLeft(r.monthsLeft)} restants
                              </p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700/40 rounded-full h-1">
                                  <div
                                    className="bg-red-400 dark:bg-red-500 h-1 rounded-full"
                                    style={{ width: `${r.progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{r.progress}%</span>
                              </div>
                            </div>
                          )
                        }
                        return (
                          <>
                            {item.notes && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.notes}</p>}
                            <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(item.updated_at)}</p>
                          </>
                        )
                      })()}
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 shrink-0">
                      {formatCurrency(item.value)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })
      )}

      <LiabilityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}

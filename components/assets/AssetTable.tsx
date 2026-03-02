'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ASSET_CATEGORIES } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import AssetDialog from './AssetDialog'
import type { Asset, AssetFormData } from '@/lib/types'

interface Props {
  assets: Asset[]
  isLoading: boolean
  onAdd: (data: AssetFormData) => Promise<void>
  onUpdate: (id: string, data: Partial<AssetFormData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  totalAssets: number
}

export default function AssetTable({ assets, isLoading, onAdd, onUpdate, onDelete, totalAssets }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(asset: Asset) {
    setEditing(asset)
    setDialogOpen(true)
  }

  async function handleSave(data: AssetFormData) {
    if (editing) {
      await onUpdate(editing.id, data)
    } else {
      await onAdd(data)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  // Group by category
  const grouped = Object.entries(ASSET_CATEGORIES).map(([key, meta]) => ({
    key,
    meta,
    items: assets.filter(a => a.category === key),
    total: assets.filter(a => a.category === key).reduce((s, a) => s + a.value, 0),
  })).filter(g => g.items.length > 0)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
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
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAssets)}</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-dashed border-slate-300 dark:border-slate-600/50 p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-3">No assets yet</p>
          <Button onClick={openAdd} variant="outline" size="sm">Add your first asset</Button>
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
                {items.map(asset => (
                  <li key={asset.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{asset.name}</p>
                      {asset.notes && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{asset.notes}</p>}
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(asset.updated_at)}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatCurrency(asset.value)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(asset)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(asset.id)}
                        disabled={deletingId === asset.id}
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

      <AssetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  )
}

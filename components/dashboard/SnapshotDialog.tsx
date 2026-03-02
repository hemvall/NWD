'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { computeMortgage, parseMortgageNotes } from '@/lib/mortgage'
import type { NetWorthSnapshot, AssetDetails, LiabilityDetails, Liability } from '@/lib/types'
import { EMPTY_ASSET_DETAILS, EMPTY_LIABILITY_DETAILS } from '@/lib/types'

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2014 }, (_, i) => String(currentYear - i))

const ASSET_FIELDS: { key: keyof AssetDetails; label: string }[] = [
  { key: 'immobilier',    label: 'Immobilier' },
  { key: 'cto',           label: 'CTO' },
  { key: 'livrets',       label: 'Livrets' },
  { key: 'cryptos',       label: 'Cryptos' },
  { key: 'voiture',       label: 'Voiture' },
  { key: 'montres',       label: 'Montres' },
  { key: 'cartesPokemon', label: 'Cartes Pokémon' },
  { key: 'jeuxPokemon',   label: 'Jeux Pokémon' },
  { key: 'autres',        label: 'Autres' },
]

const LIABILITY_FIELDS: { key: keyof LiabilityDetails; label: string }[] = [
  { key: 'creditImmobilier',  label: 'Crédit immobilier' },
  { key: 'creditConsommation',label: 'Crédit consommation' },
  { key: 'cartesCredit',      label: 'Cartes crédit' },
  { key: 'autres',            label: 'Autres' },
]

function sumValues(obj: Record<string, number>): number {
  return Object.values(obj).reduce((s, v) => s + (v || 0), 0)
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (date: string, totalAssets: number, totalLiabilities: number, assetDetails: AssetDetails, liabilityDetails: LiabilityDetails) => Promise<void>
  initial?: NetWorthSnapshot | null
  liabilities?: Liability[]
  snapshots?: NetWorthSnapshot[]
}

// Maps a Liability category to the matching LiabilityDetails field
function liabilityToDetailKey(l: Liability): keyof LiabilityDetails {
  if (l.category === 'mortgage')    return 'creditImmobilier'
  if (l.category === 'credit_card') return 'cartesCredit'
  if (l.category === 'personal' || l.category === 'car') return 'creditConsommation'
  return 'autres'
}

export default function SnapshotDialog({ open, onClose, onSave, initial, liabilities = [], snapshots = [] }: Props) {
  const [month, setMonth] = useState('01')
  const [year, setYear] = useState(String(currentYear))
  const [assetDetails, setAssetDetails] = useState<AssetDetails>({ ...EMPTY_ASSET_DETAILS })
  const [liabilityDetails, setLiabilityDetails] = useState<LiabilityDetails>({ ...EMPTY_LIABILITY_DETAILS })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoFilled, setAutoFilled] = useState(false)

  useEffect(() => {
    if (initial) {
      const [y, m] = initial.snapshot_date.split('-')
      setYear(y)
      setMonth(m)
      setAssetDetails(initial.asset_details ?? { ...EMPTY_ASSET_DETAILS })
      setLiabilityDetails(initial.liability_details ?? { ...EMPTY_LIABILITY_DETAILS })
      setAutoFilled(false)
    } else {
      const now = new Date()
      setYear(String(now.getFullYear()))
      setMonth(String(now.getMonth() + 1).padStart(2, '0'))
      // Pre-fill assets from the latest snapshot (user only updates what changed)
      const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
      setAssetDetails(latest?.asset_details ? { ...latest.asset_details } : { ...EMPTY_ASSET_DETAILS })

      // Auto-populate liabilities from live data, and derive real-estate equity
      if (liabilities.length > 0) {
        const liabDetails = { ...EMPTY_LIABILITY_DETAILS }
        let immobilierEquity = 0

        for (const l of liabilities) {
          const key = liabilityToDetailKey(l)
          const mtg = parseMortgageNotes(l.notes)
          if (mtg) {
            const result = computeMortgage(mtg)
            liabDetails[key] = (liabDetails[key] ?? 0) + result.remaining
            // Capital remboursé = capital initial - capital restant dû
            immobilierEquity += mtg.amount - result.remaining
          } else {
            liabDetails[key] = (liabDetails[key] ?? 0) + l.value
          }
        }

        for (const k of Object.keys(liabDetails) as (keyof LiabilityDetails)[]) {
          liabDetails[k] = Math.round(liabDetails[k])
        }
        setLiabilityDetails(liabDetails)

        if (immobilierEquity > 0) {
          setAssetDetails(prev => ({ ...prev, immobilier: Math.round(immobilierEquity) }))
        }
        setAutoFilled(true)
      } else {
        setLiabilityDetails({ ...EMPTY_LIABILITY_DETAILS })
        setAutoFilled(false)
      }
    }
    setError(null)
  }, [initial, open])

  const totalAssets = sumValues(assetDetails as unknown as Record<string, number>)
  const totalLiabilities = sumValues(liabilityDetails as unknown as Record<string, number>)
  const netWorth = totalAssets - totalLiabilities
  const isEditing = !!initial

  function setAsset(key: keyof AssetDetails, value: string) {
    setAssetDetails(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  function setLiability(key: keyof LiabilityDetails, value: string) {
    setLiabilityDetails(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const date = `${year}-${month}-01`
      await onSave(date, totalAssets, totalLiabilities, assetDetails, liabilityDetails)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit snapshot' : 'Add snapshot'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {/* Mois / Année */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth} disabled={isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear} disabled={isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actifs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assets</p>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAssets)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {ASSET_FIELDS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={assetDetails[key] || ''}
                    onChange={e => setAsset(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Passifs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Liabilities</p>
                {autoFilled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="h-2.5 w-2.5" />
                    auto-filled
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-red-500 dark:text-red-400">{formatCurrency(totalLiabilities)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {LIABILITY_FIELDS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={liabilityDetails[key] || ''}
                    onChange={e => setLiability(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Net Worth */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Net Worth</span>
            <span className={`text-sm font-semibold ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netWorth)}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save changes' : 'Add snapshot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

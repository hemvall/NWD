'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { LIABILITY_CATEGORIES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import {
  MTG_PREFIX,
  computeMortgage,
  encodeMortgageNotes,
  parseMortgageNotes,
  formatMonthsLeft,
} from '@/lib/mortgage'
import type { Liability, LiabilityFormData, LiabilityCategory } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: LiabilityFormData) => Promise<void>
  initial?: Liability | null
}

export default function LiabilityDialog({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<LiabilityFormData>({
    name: '',
    category: 'personal',
    value: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mortgage calculator
  const [showCalc, setShowCalc] = useState(false)
  const [mtg, setMtg] = useState({ amount: '', rate: '', months: '', startDate: '' })

  useEffect(() => {
    if (initial) {
      const stored = parseMortgageNotes(initial.notes)
      setForm({
        name: initial.name,
        category: initial.category,
        value: initial.value.toString(),
        notes: stored ? '' : (initial.notes ?? ''),
      })
      if (stored) {
        setMtg({
          amount: stored.amount.toString(),
          rate: stored.rate.toString(),
          months: stored.months.toString(),
          startDate: stored.startDate,
        })
        setShowCalc(true)
      } else {
        setMtg({ amount: '', rate: '', months: '', startDate: '' })
        setShowCalc(false)
      }
    } else {
      setForm({ name: '', category: 'personal', value: '', notes: '' })
      setMtg({ amount: '', rate: '', months: '', startDate: '' })
      setShowCalc(false)
    }
    setError(null)
  }, [initial, open])

  const isMortgage = form.category === 'mortgage'

  const mtgResult = useMemo(() => {
    if (!showCalc || !isMortgage) return null
    const amount = parseFloat(mtg.amount)
    const rate = parseFloat(mtg.rate)
    const months = parseInt(mtg.months)
    if (!amount || isNaN(rate) || !months || !mtg.startDate) return null
    return computeMortgage({ amount, rate, months, startDate: mtg.startDate })
  }, [showCalc, isMortgage, mtg])

  // Sync computed remaining balance into the value field
  useEffect(() => {
    if (mtgResult !== null) {
      setForm(f => ({ ...f, value: mtgResult.remaining.toString() }))
    }
  }, [mtgResult])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.value) return
    setLoading(true)
    setError(null)
    try {
      const notes = isMortgage && showCalc && mtgResult !== null
        ? encodeMortgageNotes({
            amount: parseFloat(mtg.amount),
            rate: parseFloat(mtg.rate),
            months: parseInt(mtg.months),
            startDate: mtg.startDate,
          })
        : form.notes
      await onSave({ ...form, notes })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const calcReady = mtgResult !== null
  const totalMonths = parseInt(mtg.months) || 0

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Liability' : 'Add Liability'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Crédit immobilier"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as LiabilityCategory }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIABILITY_CATEGORIES).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mortgage calculator — only shown for mortgage category */}
          {isMortgage && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCalc(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calculator className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Calculateur de crédit
                </span>
                {showCalc
                  ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                  : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
              </button>

              {showCalc && (
                <div className="px-4 pb-4 pt-3 space-y-3 bg-white dark:bg-transparent">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Capital emprunté (€)</Label>
                      <Input
                        type="number" min="0" step="1000"
                        placeholder="200 000"
                        value={mtg.amount}
                        onChange={e => setMtg(m => ({ ...m, amount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Taux annuel (%)</Label>
                      <Input
                        type="number" min="0" max="20" step="0.01"
                        placeholder="3.50"
                        value={mtg.rate}
                        onChange={e => setMtg(m => ({ ...m, rate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Durée totale (mois)</Label>
                      <Input
                        type="number" min="1" max="480"
                        placeholder="240"
                        value={mtg.months}
                        onChange={e => setMtg(m => ({ ...m, months: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Date de départ</Label>
                      <Input
                        type="month"
                        value={mtg.startDate}
                        onChange={e => setMtg(m => ({ ...m, startDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {calcReady && (
                    <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Capital restant dû</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(mtgResult.remaining)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Mensualité</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(mtgResult.monthly)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Durée restante</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatMonthsLeft(mtgResult.monthsLeft)}</span>
                      </div>
                      <div className="pt-1">
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                          <span>{mtgResult.progress}% remboursé</span>
                          <span>{formatMonthsLeft(mtgResult.monthsLeft)} restants</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1.5">
                          <div
                            className="bg-red-400 dark:bg-red-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${mtgResult.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="value">
              {isMortgage && showCalc && calcReady
                ? 'Capital restant dû (€) — calculé automatiquement'
                : 'Amount owed (€)'}
            </Label>
            <Input
              id="value"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              readOnly={isMortgage && showCalc && calcReady}
              className={isMortgage && showCalc && calcReady ? 'opacity-60 cursor-not-allowed' : ''}
              required
            />
          </div>

          {!(isMortgage && showCalc) && (
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? 'Save changes' : 'Add liability'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

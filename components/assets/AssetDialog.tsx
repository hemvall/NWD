'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/constants'
import type { Asset, AssetFormData, AssetCategory } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: AssetFormData) => Promise<void>
  initial?: Asset | null
}

export default function AssetDialog({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<AssetFormData>({
    name: '',
    category: 'cash',
    value: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        value: initial.value.toString(),
        notes: initial.notes ?? '',
      })
    } else {
      setForm({ name: '', category: 'cash', value: '', notes: '' })
    }
    setError(null)
  }, [initial, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.value) return
    setLoading(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Livret A"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as AssetCategory }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSET_CATEGORIES).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Value (€)</Label>
            <Input
              id="value"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              required
            />
          </div>
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
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? 'Save changes' : 'Add asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

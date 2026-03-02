'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, Download, Trash2, Target, Upload } from 'lucide-react'
import { useGoal } from '@/hooks/useGoal'
import { useAssets } from '@/hooks/useAssets'
import { useLiabilities } from '@/hooks/useLiabilities'
import { useSnapshots } from '@/hooks/useSnapshots'
import type { AssetDetails, LiabilityDetails } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface HistoricalEntry {
  date: string
  totalAssets: number
  totalLiabilities: number
  assetDetails: AssetDetails
  liabilityDetails: LiabilityDetails
}

const HISTORICAL_SNAPSHOTS: HistoricalEntry[] = [
  {
    date: '2024-09-01', totalAssets: 7850, totalLiabilities: 0,
    assetDetails: { cto: 1000, livrets: 2700, cryptos: 0, voiture: 2000, montres: 50, cartesPokemon: 100, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-01-01', totalAssets: 9960, totalLiabilities: 0,
    assetDetails: { cto: 1800, livrets: 2900, cryptos: 1060, voiture: 2000, montres: 50, cartesPokemon: 150, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-05-02', totalAssets: 10550, totalLiabilities: 3300,
    assetDetails: { cto: 1900, livrets: 3100, cryptos: 1300, voiture: 2000, montres: 50, cartesPokemon: 200, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 3300, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-06-25', totalAssets: 13340, totalLiabilities: 1800,
    assetDetails: { cto: 1000, livrets: 1700, cryptos: 390, voiture: 8000, montres: 50, cartesPokemon: 200, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 1800, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-09-01', totalAssets: 12700, totalLiabilities: 800,
    assetDetails: { cto: 1100, livrets: 600, cryptos: 700, voiture: 8000, montres: 50, cartesPokemon: 250, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 800, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-10-01', totalAssets: 13200, totalLiabilities: 800,
    assetDetails: { cto: 1000, livrets: 1300, cryptos: 600, voiture: 8000, montres: 50, cartesPokemon: 250, jeuxPokemon: 1000, autres: 1000 },
    liabilityDetails: { creditImmobilier: 800, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-11-20', totalAssets: 12650, totalLiabilities: 0,
    assetDetails: { cto: 1100, livrets: 600, cryptos: 0, voiture: 8000, montres: 530, cartesPokemon: 400, jeuxPokemon: 1020, autres: 1000 },
    liabilityDetails: { creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2025-12-01', totalAssets: 15380, totalLiabilities: 0,
    assetDetails: { cto: 650, livrets: 1000, cryptos: 220, voiture: 10000, montres: 530, cartesPokemon: 960, jeuxPokemon: 1020, autres: 1000 },
    liabilityDetails: { creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
  {
    date: '2026-02-01', totalAssets: 16770, totalLiabilities: 0,
    assetDetails: { cto: 600, livrets: 1800, cryptos: 520, voiture: 10000, montres: 530, cartesPokemon: 1300, jeuxPokemon: 1020, autres: 1000 },
    liabilityDetails: { creditImmobilier: 0, creditConsommation: 0, cartesCredit: 0, autres: 0 },
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { goal, saveGoal, deleteGoal, isLoading: goalLoading } = useGoal()
  const { assets } = useAssets()
  const { liabilities } = useLiabilities()
  const { upsertSnapshot } = useSnapshots()

  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [goalLabel, setGoalLabel] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])

  useEffect(() => {
    if (goal) {
      setTargetAmount(goal.target_net_worth.toString())
      setTargetDate(goal.target_date ?? '')
      setGoalLabel(goal.label ?? '')
    }
  }, [goal])

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!targetAmount) return
    setSavingGoal(true)
    try {
      await saveGoal(parseFloat(targetAmount), targetDate || undefined, goalLabel || undefined)
      setGoalSaved(true)
      setTimeout(() => setGoalSaved(false), 2000)
    } finally {
      setSavingGoal(false)
    }
  }

  function exportJSON() {
    const data = { assets, liabilities, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `net-worth-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    const assetRows = assets.map(a =>
      `"asset","${a.name}","${a.category}",${a.value},"${a.notes ?? ''}","${a.created_at}"`
    )
    const liabilityRows = liabilities.map(l =>
      `"liability","${l.name}","${l.category}",${l.value},"${l.notes ?? ''}","${l.created_at}"`
    )
    const csv = ['type,name,category,value,notes,created_at', ...assetRows, ...liabilityRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `net-worth-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAll() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await supabase.from('assets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('liabilities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('net_worth_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      router.refresh()
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  async function handleImportHistory() {
    setImporting(true)
    try {
      for (const snap of HISTORICAL_SNAPSHOTS) {
        await upsertSnapshot(snap.date, snap.totalAssets, snap.totalLiabilities, snap.assetDetails, snap.liabilityDetails)
      }
      setImportDone(true)
      setTimeout(() => setImportDone(false), 3000)
    } finally {
      setImporting(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-xl mx-auto w-full space-y-6">

        {/* Account */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{userEmail ?? '—'}</p>
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
        </section>

        <Separator />

        {/* Goal */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Net Worth Goal</h2>
          </div>
          <form onSubmit={handleSaveGoal} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-label">Goal label (optional)</Label>
              <Input
                id="goal-label"
                placeholder="e.g. Financial independence"
                value={goalLabel}
                onChange={e => setGoalLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target">Target net worth (€)</Label>
              <Input
                id="target"
                type="number"
                placeholder="e.g. 500000"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target-date">Target date (optional)</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={savingGoal || goalLoading} className="gap-1.5">
                {savingGoal && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {goalSaved ? 'Saved!' : 'Save goal'}
              </Button>
              {goal && (
                <Button type="button" size="sm" variant="ghost" onClick={() => deleteGoal()}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Remove
                </Button>
              )}
            </div>
          </form>
        </section>

        <Separator />

        {/* Export */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Export Data</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Download all your assets and liabilities data.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
            <Button variant="outline" size="sm" onClick={exportJSON}>Export JSON</Button>
          </div>
        </section>

        <Separator />

        {/* Import historique */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Import historical data</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Import your pre-existing net worth history (Sep 2024 → Feb 2026). Already imported entries will be updated.
          </p>
          <Button variant="outline" size="sm" onClick={handleImportHistory} disabled={importing} className="gap-1.5">
            {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {importDone ? 'Imported!' : importing ? 'Importing…' : 'Import 9 snapshots'}
          </Button>
        </section>

        <Separator />

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Permanently delete all your data. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {confirmDelete ? 'Click again to confirm' : 'Delete all data'}
          </Button>
        </section>

      </main>
    </>
  )
}

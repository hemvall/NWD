'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/lib/types'

interface Props {
  latestSnapshot: NetWorthSnapshot | null
  totalLiabilities: number
  isLoading: boolean
}

interface SimParams {
  monthlyCTO: number
  monthlyLivrets: number
  monthlyCryptos: number
  returnCTO: number
  returnLivrets: number
  returnCryptos: number
  horizon: number
}

const DEFAULT_PARAMS: SimParams = {
  monthlyCTO: 0,
  monthlyLivrets: 0,
  monthlyCryptos: 0,
  returnCTO: 8,
  returnLivrets: 3,
  returnCryptos: 10,
  horizon: 10,
}

const FLOATING_SYMBOLS = [
  { char: '$', size: 'text-lg', duration: '12s', delay: '0s', left: '8%', opacity: 0.07 },
  { char: '€', size: 'text-2xl', duration: '18s', delay: '2s', left: '22%', opacity: 0.06 },
  { char: '₿', size: 'text-base', duration: '15s', delay: '4s', left: '38%', opacity: 0.08 },
  { char: '◆', size: 'text-sm', duration: '20s', delay: '1s', left: '55%', opacity: 0.05 },
  { char: '₿', size: 'text-xl', duration: '14s', delay: '6s', left: '70%', opacity: 0.07 },
  { char: '$', size: 'text-base', duration: '16s', delay: '3s', left: '85%', opacity: 0.06 },
  { char: '€', size: 'text-sm', duration: '22s', delay: '5s', left: '48%', opacity: 0.05 },
  { char: '◆', size: 'text-lg', duration: '13s', delay: '7s', left: '15%', opacity: 0.06 },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-[#0d1b30]/95 backdrop-blur-sm border border-slate-200 dark:border-slate-600/50 rounded-xl px-3 py-2.5 shadow-xl text-sm">
      <p className="text-slate-500 dark:text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-slate-900 dark:text-white">
          <span style={{ color: entry.color }}>●</span>{' '}
          {entry.name} : {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  max,
  step = 1,
  accentClass = 'focus:ring-emerald-500',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix: string
  min?: number
  max?: number
  step?: number
  accentClass?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px]">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={`w-20 px-2 py-1 text-sm rounded-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 ${accentClass} transition-shadow`}
      />
      <span className="text-xs text-slate-400 dark:text-slate-500">{suffix}</span>
    </div>
  )
}

export default function ProjectionSimulator({ latestSnapshot, totalLiabilities, isLoading }: Props) {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS)

  const update = (key: keyof SimParams, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  // Extract starting values from the latest snapshot
  const startValues = useMemo(() => {
    const ad = latestSnapshot?.asset_details
    return {
      cto: ad?.cto ?? 0,
      livrets: ad?.livrets ?? 0,
      cryptos: ad?.cryptos ?? 0,
      otherAssets:
        (ad?.immobilier ?? 0) +
        (ad?.voiture ?? 0) +
        (ad?.montres ?? 0) +
        (ad?.cartesPokemon ?? 0) +
        (ad?.jeuxPokemon ?? 0) +
        (ad?.autres ?? 0),
      liabilities: totalLiabilities,
    }
  }, [latestSnapshot, totalLiabilities])

  // Compute projection data
  const projectionData = useMemo(() => {
    const data: Array<{
      year: string
      cto: number
      livrets: number
      cryptos: number
      autres: number
      total: number
    }> = []

    let cto = startValues.cto
    let livrets = startValues.livrets
    let cryptos = startValues.cryptos
    const autres = startValues.otherAssets - startValues.liabilities // net "other" stays constant

    const currentYear = new Date().getFullYear()
    // Determine how many months remain in the current year from the snapshot date
    const snapshotMonth = latestSnapshot?.snapshot_date
      ? new Date(latestSnapshot.snapshot_date).getMonth() // 0-based
      : new Date().getMonth()
    const remainingMonths = 12 - (snapshotMonth + 1) // months left after the snapshot month

    // Year 0 = today
    data.push({
      year: `${currentYear}`,
      cto,
      livrets,
      cryptos,
      autres: Math.max(autres, 0),
      total: cto + livrets + cryptos + autres,
    })

    for (let y = 1; y <= params.horizon; y++) {
      const months = y === 1 ? remainingMonths : 12
      const fraction = months / 12
      cto = (cto + params.monthlyCTO * months) * (1 + (params.returnCTO / 100) * fraction)
      livrets = (livrets + params.monthlyLivrets * months) * (1 + (params.returnLivrets / 100) * fraction)
      cryptos = (cryptos + params.monthlyCryptos * months) * (1 + (params.returnCryptos / 100) * fraction)

      data.push({
        year: `${currentYear + y}`,
        cto: Math.round(cto),
        livrets: Math.round(livrets),
        cryptos: Math.round(cryptos),
        autres: Math.max(autres, 0),
        total: Math.round(cto + livrets + cryptos + autres),
      })
    }

    return data
  }, [params, startValues])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700/60 rounded mb-4" />
        <div className="h-48 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/50 dark:border-indigo-500/20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-cyan-50 dark:from-[#0a0f24] dark:via-[#0d1333] dark:to-[#091022] animate-gradient-shift" />

      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
                           radial-gradient(circle at 50% 10%, #06b6d4 0%, transparent 40%)`,
        }}
      />

      {/* Floating symbols */}
      {FLOATING_SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`absolute ${s.size} text-indigo-500 dark:text-indigo-400 pointer-events-none select-none animate-float-up`}
          style={{
            left: s.left,
            opacity: s.opacity,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Projection</h3>
        </div>

        {/* Inputs */}
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {/* CTO */}
          <div className="space-y-2 p-3 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-cyan-200/40 dark:border-cyan-500/10">
            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">CTO</p>
            <NumberInput
              label="Mensuel"
              value={params.monthlyCTO}
              onChange={(v) => update('monthlyCTO', v)}
              suffix="€/mois"
              accentClass="focus:ring-cyan-500"
            />
            <NumberInput
              label="Rendement"
              value={params.returnCTO}
              onChange={(v) => update('returnCTO', v)}
              suffix="%/an"
              step={0.5}
              accentClass="focus:ring-cyan-500"
            />
          </div>

          {/* Livrets */}
          <div className="space-y-2 p-3 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-500/10">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Livrets</p>
            <NumberInput
              label="Mensuel"
              value={params.monthlyLivrets}
              onChange={(v) => update('monthlyLivrets', v)}
              suffix="€/mois"
              accentClass="focus:ring-emerald-500"
            />
            <NumberInput
              label="Rendement"
              value={params.returnLivrets}
              onChange={(v) => update('returnLivrets', v)}
              suffix="%/an"
              step={0.5}
              accentClass="focus:ring-emerald-500"
            />
          </div>

          {/* Cryptos */}
          <div className="space-y-2 p-3 rounded-xl bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm border border-violet-200/40 dark:border-violet-500/10">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">Cryptos</p>
            <NumberInput
              label="Mensuel"
              value={params.monthlyCryptos}
              onChange={(v) => update('monthlyCryptos', v)}
              suffix="€/mois"
              accentClass="focus:ring-violet-500"
            />
            <NumberInput
              label="Rendement"
              value={params.returnCryptos}
              onChange={(v) => update('returnCryptos', v)}
              suffix="%/an"
              step={0.5}
              accentClass="focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Horizon slider */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Horizon
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={params.horizon}
            onChange={(e) => update('horizon', Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-slate-200/70 dark:bg-white/10 accent-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[50px] text-right">
            {params.horizon} ans
          </span>
        </div>

        {/* Chart */}
        <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl p-3 border border-white/30 dark:border-white/5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barCTO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id="barLivrets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="barCryptos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="barAutres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200/50 dark:text-slate-700/30"
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v, true)}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="cto" name="CTO" stackId="a" fill="url(#barCTO)" />
              <Bar dataKey="livrets" name="Livrets" stackId="a" fill="url(#barLivrets)" />
              <Bar dataKey="cryptos" name="Cryptos" stackId="a" fill="url(#barCryptos)" />
              <Bar dataKey="autres" name="Autres (net)" stackId="a" fill="url(#barAutres)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary table */}
        <div className="mt-5 overflow-x-auto bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl p-3 border border-white/30 dark:border-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/30">
                <th className="text-left py-2 pr-3 text-slate-500 dark:text-slate-400 font-medium">Année</th>
                <th className="text-right py-2 px-3 text-cyan-600 dark:text-cyan-400 font-medium">CTO</th>
                <th className="text-right py-2 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Livrets</th>
                <th className="text-right py-2 px-3 text-violet-600 dark:text-violet-400 font-medium">Cryptos</th>
                <th className="text-right py-2 pl-3 text-slate-900 dark:text-white font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {projectionData.map((row, i) => (
                <tr key={row.year} className={`border-b border-slate-100/50 dark:border-slate-800/30 ${i === 0 ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                  <td className="py-1.5 pr-3 text-slate-600 dark:text-slate-300 font-medium">{row.year}</td>
                  <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.cto)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.livrets)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.cryptos)}</td>
                  <td className="py-1.5 pl-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

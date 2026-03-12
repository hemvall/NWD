'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
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
  monthlyCTO: 0, monthlyLivrets: 0, monthlyCryptos: 0,
  returnCTO: 8, returnLivrets: 3, returnCryptos: 10, horizon: 10,
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 shadow-xl text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/40 mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-white/80 text-xs font-mono">
          <span style={{ color: entry.color }}>&#9679;</span>{' '}
          {entry.name} : {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

function NumInput({
  label, value, onChange, suffix, step = 1, accent = 'cyan',
}: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number; accent?: string
}) {
  const ringColor = accent === 'cyan' ? 'focus:ring-cyan-500/50' : accent === 'green' ? 'focus:ring-emerald-500/50' : 'focus:ring-violet-500/50'
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-white/30 whitespace-nowrap min-w-[80px]">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        className={`w-20 px-2 py-1 text-sm rounded-lg border border-white/[0.06] bg-white/[0.03] text-white text-right focus:outline-none focus:ring-1 ${ringColor} transition-shadow font-mono`}
      />
      <span className="text-[10px] text-white/20">{suffix}</span>
    </div>
  )
}

export default function ProjectionSimulator({ latestSnapshot, totalLiabilities, isLoading }: Props) {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS)
  const update = (key: keyof SimParams, value: number) => setParams((prev) => ({ ...prev, [key]: value }))

  const startValues = useMemo(() => {
    const ad = latestSnapshot?.asset_details
    return {
      cto: ad?.cto ?? 0,
      livrets: ad?.livrets ?? 0,
      cryptos: ad?.cryptos ?? 0,
      otherAssets:
        (ad?.immobilier ?? 0) + (ad?.voiture ?? 0) + (ad?.montres ?? 0) +
        (ad?.cartesPokemon ?? 0) + (ad?.jeuxPokemon ?? 0) + (ad?.autres ?? 0),
      liabilities: totalLiabilities,
    }
  }, [latestSnapshot, totalLiabilities])

  const projectionData = useMemo(() => {
    const data: Array<{ year: string; cto: number; livrets: number; cryptos: number; autres: number; total: number }> = []
    let cto = startValues.cto
    let livrets = startValues.livrets
    let cryptos = startValues.cryptos
    const autres = startValues.otherAssets - startValues.liabilities

    const currentYear = new Date().getFullYear()
    const snapshotMonth = latestSnapshot?.snapshot_date
      ? new Date(latestSnapshot.snapshot_date).getMonth()
      : new Date().getMonth()
    const remainingMonths = 12 - (snapshotMonth + 1)

    data.push({ year: `${currentYear}`, cto, livrets, cryptos, autres: Math.max(autres, 0), total: cto + livrets + cryptos + autres })

    for (let y = 1; y <= params.horizon; y++) {
      const months = y === 1 ? remainingMonths : 12
      const fraction = months / 12
      cto = (cto + params.monthlyCTO * months) * (1 + (params.returnCTO / 100) * fraction)
      livrets = (livrets + params.monthlyLivrets * months) * (1 + (params.returnLivrets / 100) * fraction)
      cryptos = (cryptos + params.monthlyCryptos * months) * (1 + (params.returnCryptos / 100) * fraction)
      data.push({
        year: `${currentYear + y}`,
        cto: Math.round(cto), livrets: Math.round(livrets), cryptos: Math.round(cryptos),
        autres: Math.max(autres, 0), total: Math.round(cto + livrets + cryptos + autres),
      })
    }
    return data
  }, [params, startValues, latestSnapshot])

  if (isLoading) return <div className="h-48 glass-inner animate-pulse rounded-xl" />

  return (
    <div>
      {/* Inputs */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {[
          { key: 'CTO', monthly: 'monthlyCTO' as const, ret: 'returnCTO' as const, accent: 'cyan', border: 'border-cyan-500/10', titleClass: 'text-cyan-400' },
          { key: 'Livrets', monthly: 'monthlyLivrets' as const, ret: 'returnLivrets' as const, accent: 'green', border: 'border-emerald-500/10', titleClass: 'text-emerald-400' },
          { key: 'Cryptos', monthly: 'monthlyCryptos' as const, ret: 'returnCryptos' as const, accent: 'violet', border: 'border-violet-500/10', titleClass: 'text-violet-400' },
        ].map(({ key, monthly, ret, accent, border, titleClass }) => (
          <div key={key} className={`space-y-2 p-3 rounded-xl glass-inner ${border}`}>
            <p className={`text-xs font-semibold ${titleClass}`}>{key}</p>
            <NumInput label="Mensuel" value={params[monthly]} onChange={(v) => update(monthly, v)} suffix="EUR/mois" accent={accent} />
            <NumInput label="Rendement" value={params[ret]} onChange={(v) => update(ret, v)} suffix="%/an" step={0.5} accent={accent} />
          </div>
        ))}
      </div>

      {/* Horizon */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-white/30 whitespace-nowrap">Horizon</label>
        <input
          type="range" min={1} max={30} value={params.horizon}
          onChange={(e) => update('horizon', Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-white/5 accent-cyan-500 cursor-pointer"
        />
        <span className="text-sm font-medium font-mono text-white/60 min-w-[50px] text-right">{params.horizon} ans</span>
      </div>

      {/* Chart */}
      <div className="glass-inner rounded-xl p-3">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barCTO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
              <linearGradient id="barLivrets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="barCryptos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="barAutres" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" /><stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
            <Bar dataKey="cto" name="CTO" stackId="a" fill="url(#barCTO)" />
            <Bar dataKey="livrets" name="Livrets" stackId="a" fill="url(#barLivrets)" />
            <Bar dataKey="cryptos" name="Cryptos" stackId="a" fill="url(#barCryptos)" />
            <Bar dataKey="autres" name="Autres (net)" stackId="a" fill="url(#barAutres)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-4 overflow-x-auto glass-inner rounded-xl p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 pr-3 text-white/30 font-medium">Annee</th>
              <th className="text-right py-2 px-3 text-cyan-400/60 font-medium">CTO</th>
              <th className="text-right py-2 px-3 text-emerald-400/60 font-medium">Livrets</th>
              <th className="text-right py-2 px-3 text-violet-400/60 font-medium">Cryptos</th>
              <th className="text-right py-2 pl-3 text-white/60 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {projectionData.map((row, i) => (
              <tr key={row.year} className={`border-b border-white/[0.03] ${i === 0 ? 'bg-cyan-500/5' : ''}`}>
                <td className="py-1.5 pr-3 text-white/50 font-medium">{row.year}</td>
                <td className="py-1.5 px-3 text-right text-white/30 font-mono">{formatCurrency(row.cto)}</td>
                <td className="py-1.5 px-3 text-right text-white/30 font-mono">{formatCurrency(row.livrets)}</td>
                <td className="py-1.5 px-3 text-right text-white/30 font-mono">{formatCurrency(row.cryptos)}</td>
                <td className="py-1.5 pl-3 text-right font-semibold font-mono text-white/70">{formatCurrency(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

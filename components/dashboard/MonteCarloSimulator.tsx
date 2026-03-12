'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot } from '@/lib/types'

interface Props {
  latestSnapshot: NetWorthSnapshot | null
  totalLiabilities: number
  isLoading: boolean
}

const MILESTONES = [25_000, 35_000, 50_000, 75_000, 100_000]

interface ScenarioParams {
  label: string
  monthlySavings: number
  annualReturn: number
  annualVolatility: number
}

const DEFAULT_SCENARIOS: Record<string, ScenarioParams> = {
  pessimiste: { label: 'Pessimiste', monthlySavings: 300, annualReturn: 3, annualVolatility: 12 },
  realiste: { label: 'Realiste', monthlySavings: 500, annualReturn: 7, annualVolatility: 15 },
  optimiste: { label: 'Optimiste', monthlySavings: 800, annualReturn: 11, annualVolatility: 20 },
}

const NUM_SIMULATIONS = 1000

function gaussianRandom(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function runMonteCarlo(
  startingNW: number,
  params: ScenarioParams,
  horizonYears: number,
): {
  yearlyPercentiles: Array<{ year: number; p10: number; p25: number; p50: number; p75: number; p90: number }>
  finalValues: number[]
} {
  const monthlyReturn = params.annualReturn / 100 / 12
  const monthlyVol = (params.annualVolatility / 100) / Math.sqrt(12)
  const totalMonths = horizonYears * 12
  const allFinals: number[] = []
  const pathsByYear: number[][] = Array.from({ length: horizonYears + 1 }, () => [])

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    let nw = startingNW
    pathsByYear[0].push(nw)
    for (let m = 1; m <= totalMonths; m++) {
      const shock = gaussianRandom()
      const monthReturn = monthlyReturn + monthlyVol * shock
      nw = nw * (1 + monthReturn) + params.monthlySavings
      if (m % 12 === 0) pathsByYear[m / 12].push(nw)
    }
    allFinals.push(nw)
  }

  const yearlyPercentiles = pathsByYear.map((values, year) => {
    const sorted = [...values].sort((a, b) => a - b)
    const pct = (p: number) => sorted[Math.floor((p / 100) * sorted.length)] ?? sorted[sorted.length - 1]
    return {
      year: new Date().getFullYear() + year,
      p10: Math.round(pct(10)), p25: Math.round(pct(25)), p50: Math.round(pct(50)),
      p75: Math.round(pct(75)), p90: Math.round(pct(90)),
    }
  })

  return { yearlyPercentiles, finalValues: allFinals }
}

function NumInput({ label, value, onChange, suffix, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; suffix: string; step?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-white/30 whitespace-nowrap min-w-[80px]">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} step={step}
        className="w-20 px-2 py-1 text-sm rounded-lg border border-white/[0.06] bg-white/[0.03] text-white text-right focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-shadow font-mono" />
      <span className="text-[10px] text-white/20">{suffix}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 shadow-xl text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/40 mb-1 font-medium">{label}</p>
      {payload.filter(e => e.value !== undefined).map((entry) => (
        <p key={entry.name} className="text-white/80 text-xs font-mono">
          <span style={{ color: entry.color }}>&#9679;</span> {entry.name} : {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function MonteCarloSimulator({ latestSnapshot, totalLiabilities, isLoading }: Props) {
  const [activeScenario, setActiveScenario] = useState<string>('realiste')
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS)
  const [horizon, setHorizon] = useState(10)
  const [runKey, setRunKey] = useState(0)

  const startingNW = useMemo(() => latestSnapshot?.net_worth ?? 0, [latestSnapshot])

  const updateScenario = (key: string, field: keyof ScenarioParams, value: number | string) => {
    setScenarios(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const rerun = useCallback(() => setRunKey(k => k + 1), [])

  const allMCResults = useMemo(() => {
    const results: Record<string, ReturnType<typeof runMonteCarlo>> = {}
    for (const [key, params] of Object.entries(scenarios)) {
      results[key] = runMonteCarlo(startingNW, params, horizon)
    }
    return results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startingNW, scenarios, horizon, runKey])

  const { yearlyPercentiles, finalValues } = allMCResults[activeScenario]

  // Milestone probabilities per scenario
  const milestoneProbabilities = useMemo(() => {
    const result: Record<string, Record<number, number>> = {}
    for (const [key, mc] of Object.entries(allMCResults)) {
      result[key] = {}
      for (const milestone of MILESTONES) {
        const above = mc.finalValues.filter(v => v >= milestone).length
        result[key][milestone] = (above / mc.finalValues.length) * 100
      }
    }
    return result
  }, [allMCResults])

  const deterministicProjections = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const data: Array<{ year: number; pessimiste: number; realiste: number; optimiste: number }> = []
    for (let y = 0; y <= horizon; y++) {
      const row: Record<string, number> = { year: currentYear + y }
      for (const [key, params] of Object.entries(scenarios)) {
        const monthlyReturn = params.annualReturn / 100 / 12
        let nw = startingNW
        for (let m = 0; m < y * 12; m++) nw = nw * (1 + monthlyReturn) + params.monthlySavings
        row[key] = Math.round(nw)
      }
      data.push(row as { year: number; pessimiste: number; realiste: number; optimiste: number })
    }
    return data
  }, [scenarios, startingNW, horizon])

  if (isLoading) return <div className="h-64 glass-inner animate-pulse rounded-xl" />

  const scenarioColors: Record<string, { bg: string; text: string; border: string }> = {
    pessimiste: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    realiste: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    optimiste: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Object.entries(scenarios).map(([key, s]) => {
            const c = scenarioColors[key]
            return (
              <button key={key} onClick={() => setActiveScenario(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeScenario === key
                    ? `${c.bg} ${c.text} border ${c.border}`
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}>
                {s.label}
              </button>
            )
          })}
        </div>
        <button onClick={rerun}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white/30 hover:text-white/60 bg-white/[0.03] rounded-lg border border-white/[0.06] transition-colors">
          <RefreshCw className="h-3 w-3" /> Relancer
        </button>
      </div>

      {/* Scenario parameters */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {Object.entries(scenarios).map(([key, s]) => {
          const c = scenarioColors[key]
          return (
            <div key={key} className={`space-y-2 p-3 rounded-xl glass-inner ${c.border}`}>
              <p className={`text-xs font-semibold ${c.text}`}>{s.label}</p>
              <NumInput label="Epargne" value={s.monthlySavings} onChange={(v) => updateScenario(key, 'monthlySavings', v)} suffix="EUR/mois" />
              <NumInput label="Rendement" value={s.annualReturn} onChange={(v) => updateScenario(key, 'annualReturn', v)} suffix="%/an" step={0.5} />
              <NumInput label="Volatilite" value={s.annualVolatility} onChange={(v) => updateScenario(key, 'annualVolatility', v)} suffix="%/an" />
            </div>
          )
        })}
      </div>

      {/* Horizon */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-xs text-white/30 whitespace-nowrap">Horizon</label>
        <input type="range" min={1} max={30} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-white/5 accent-orange-500 cursor-pointer" />
        <span className="text-sm font-medium font-mono text-white/60 min-w-[50px] text-right">{horizon} ans</span>
      </div>

      {/* Milestone probability grid */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Probabilite par palier ({horizon} ans)</p>
        <div className="glass-inner rounded-xl p-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 pr-3 text-white/30 font-medium">Palier</th>
                {Object.entries(scenarios).map(([key, s]) => (
                  <th key={key} className={`text-right py-2 px-3 font-medium ${scenarioColors[key].text}`}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map(milestone => (
                <tr key={milestone} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-3 text-white/50 font-mono font-medium">{formatCurrency(milestone, true)}</td>
                  {Object.keys(scenarios).map(key => {
                    const prob = milestoneProbabilities[key]?.[milestone] ?? 0
                    const reached = startingNW >= milestone
                    return (
                      <td key={key} className="py-2 px-3 text-right">
                        {reached ? (
                          <span className="text-emerald-400 font-bold font-mono">Atteint</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${prob}%`,
                                  background: prob >= 70 ? '#34d399' : prob >= 40 ? '#fbbf24' : '#ef4444',
                                  boxShadow: `0 0 4px ${prob >= 70 ? 'rgba(52,211,153,0.4)' : prob >= 40 ? 'rgba(251,191,36,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                }}
                              />
                            </div>
                            <span className={`font-bold font-mono min-w-[36px] text-right ${
                              prob >= 70 ? 'text-emerald-400' : prob >= 40 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {prob.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monte Carlo fan chart */}
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
        Distribution MC &mdash; {scenarios[activeScenario].label}
        <span className="ml-1 opacity-60">({NUM_SIMULATIONS} sim.)</span>
      </p>
      <div className="glass-inner rounded-xl p-3 mb-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={yearlyPercentiles} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mcOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.1} /><stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="mcInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} /><stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<CustomTooltip />} />
            {MILESTONES.filter(m => m > startingNW).map(m => (
              <ReferenceLine key={m} y={m} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" strokeWidth={1}
                label={{ value: formatCurrency(m, true), position: 'right', fontSize: 9, fill: 'rgba(255,255,255,0.2)' }} />
            ))}
            <Area type="monotone" dataKey="p90" stackId="band1" stroke="none" fill="url(#mcOuter)" name="P90" />
            <Area type="monotone" dataKey="p10" stackId="band1" stroke="none" fill="transparent" name="P10" />
            <Area type="monotone" dataKey="p75" stackId="band2" stroke="none" fill="url(#mcInner)" name="P75" />
            <Area type="monotone" dataKey="p25" stackId="band2" stroke="none" fill="transparent" name="P25" />
            <Area type="monotone" dataKey="p50" stroke="#f97316" strokeWidth={2.5} fill="none" name="Mediane" dot={false}
              style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3-scenario comparison */}
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Comparaison 3 scenarios</p>
      <div className="glass-inner rounded-xl p-3">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={deterministicProjections} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scenPess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="scenReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.15} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="scenOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<CustomTooltip />} />
            {MILESTONES.filter(m => m > startingNW).map(m => (
              <ReferenceLine key={m} y={m} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" strokeWidth={1} />
            ))}
            <Area type="monotone" dataKey="pessimiste" name="Pessimiste" stroke="#ef4444" strokeWidth={2} fill="url(#scenPess)" dot={false} />
            <Area type="monotone" dataKey="realiste" name="Realiste" stroke="#22d3ee" strokeWidth={2} fill="url(#scenReal)" dot={false} />
            <Area type="monotone" dataKey="optimiste" name="Optimiste" stroke="#10b981" strokeWidth={2} fill="url(#scenOpt)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

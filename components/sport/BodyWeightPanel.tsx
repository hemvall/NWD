'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Scale, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { todayISO } from '@/lib/utils'
import type { BodyEntry } from '@/lib/sport'

interface Props {
  entries: BodyEntry[]
  targetWeightKg?: number | null
  onAdd: (date: string, weightKg: number) => void
  onDelete: (id: string) => void
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/40 mb-0.5 text-xs">{label}</p>
      <p className="font-bold font-mono neon-text-cyan">{payload[0].value} kg</p>
    </div>
  )
}

export default function BodyWeightPanel({ entries, targetWeightKg, onAdd, onDelete }: Props) {
  const [date, setDate] = useState(todayISO())
  const [weight, setWeight] = useState('')

  const latest = entries[entries.length - 1]
  const previous = entries[entries.length - 2]
  const change = latest && previous ? latest.weightKg - previous.weightKg : null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!weight || +weight <= 0) return
    onAdd(date, +weight)
    setWeight('')
  }

  const chartData = entries.map(e => ({
    date: format(new Date(e.date), 'd MMM'),
    value: e.weightKg,
  }))

  const fieldCls = 'bg-[#0a1426] border border-cyan-400/20 text-cyan-50 text-sm font-mono px-3 py-2 rounded-sm outline-none focus:border-cyan-400/60 transition-colors'

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Poids corporel</h3>
        </div>
        {change !== null && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border"
            style={{ color: change > 0 ? '#34d399' : change < 0 ? '#f472b6' : '#94a3b8', borderColor: 'rgba(56,189,248,0.2)' }}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
            {change > 0 ? '+' : ''}{change.toFixed(1)} kg
          </span>
        )}
      </div>

      {/* Add form */}
      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${fieldCls} flex-1`} />
        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg" className={`${fieldCls} w-24`} />
        <button type="submit" className="flex items-center justify-center px-3 border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {entries.length < 2 ? (
        <div className="flex items-center justify-center h-40 text-cyan-100/20 text-xs font-mono glass-inner rounded-lg">
          Ajoutez au moins 2 pesées pour voir la courbe
        </div>
      ) : (
        <div className="glass-inner rounded-lg p-3 mb-3">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v}`} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} width={32} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2.5} fill="url(#bwGradient)" dot={false}
                activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }} style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.4))' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {[...entries].reverse().slice(0, 6).map(e => (
            <div key={e.id} className="flex items-center justify-between glass-inner rounded-md px-3 py-1.5">
              <span className="text-[11px] font-mono text-cyan-100/50">{format(new Date(e.date), 'd MMM yyyy')}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-100/80">{e.weightKg} kg</span>
                <button onClick={() => onDelete(e.id)} className="text-cyan-100/20 hover:text-pink-400 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {targetWeightKg && latest && (
        <p className="text-[10px] font-mono text-cyan-100/30 mt-3 text-center">
          Cible : {targetWeightKg} kg · reste {Math.abs(targetWeightKg - latest.weightKg).toFixed(1)} kg
        </p>
      )}
    </div>
  )
}

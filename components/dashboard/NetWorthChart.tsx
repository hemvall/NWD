'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import type { NetWorthSnapshot } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  snapshots: NetWorthSnapshot[]
  isLoading: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 shadow-xl text-sm !bg-[#0d1b30]/95 !border-white/10">
      <p className="text-white/40 mb-0.5">{label}</p>
      <p className="font-bold font-mono neon-text-cyan">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function NetWorthChart({ snapshots, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-48 glass-inner animate-pulse rounded-xl" />
    )
  }

  if (snapshots.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-white/20 text-sm glass-inner rounded-xl">
        Ajoutez au moins 2 snapshots pour voir le graphique
      </div>
    )
  }

  const chartData = snapshots.map(s => {
    const d = new Date(s.snapshot_date)
    const label = d.getDate() === 1 ? format(d, 'MMM yyyy') : format(d, 'MMM d')
    return { date: label, value: s.net_worth }
  })

  const minValue = Math.min(...chartData.map(d => d.value))
  const domain: [number | string, number | string] = [
    Math.floor(minValue * (minValue >= 0 ? 0.95 : 1.05)),
    'auto',
  ]

  return (
    <div className="glass-inner rounded-xl p-3">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCurrency(v, true)}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
            width={72}
            domain={domain}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill="url(#nwGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.4))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

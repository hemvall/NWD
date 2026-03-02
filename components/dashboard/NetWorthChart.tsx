'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    <div className="bg-white dark:bg-[#0b1830] border border-slate-200 dark:border-slate-600/50 rounded-xl px-3 py-2.5 shadow-lg text-sm">
      <p className="text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function NetWorthChart({ snapshots, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700/60 rounded mb-4 animate-pulse" />
        <div className="h-48 bg-slate-100 dark:bg-slate-700/40 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (snapshots.length < 2) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Net Worth Over Time</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
          Add data over multiple days to see your chart
        </div>
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
    <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Net Worth Over Time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCurrency(v, true)}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            axisLine={false}
            tickLine={false}
            width={72}
            domain={domain}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#nwGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

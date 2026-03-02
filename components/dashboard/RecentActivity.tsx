'use client'

import { formatCurrency, formatRelative } from '@/lib/utils'
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '@/lib/constants'
import type { Asset, Liability } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  assets: Asset[]
  liabilities: Liability[]
  isLoading: boolean
}

export default function RecentActivity({ assets, liabilities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700/60 rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700/60 rounded mb-1" />
                <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-700/30 rounded" />
              </div>
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const combined = [
    ...assets.map(a => ({ ...a, type: 'asset' as const })),
    ...liabilities.map(l => ({ ...l, type: 'liability' as const })),
  ]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  return (
    <div className="bg-white dark:bg-[#0b1526] rounded-2xl border border-slate-200 dark:border-slate-700/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
      {combined.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">No entries yet. Add your first asset or liability.</p>
      ) : (
        <ul className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {combined.map(item => {
            const meta = item.type === 'asset'
              ? ASSET_CATEGORIES[item.category as keyof typeof ASSET_CATEGORIES]
              : LIABILITY_CATEGORIES[item.category as keyof typeof LIABILITY_CATEGORIES]
            const Icon = meta.icon
            return (
              <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 min-w-0">
                <div className={cn('p-1.5 rounded-lg shrink-0', meta.bgColor)}>
                  <Icon className={cn('h-4 w-4', meta.textColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatRelative(item.updated_at)}</p>
                </div>
                <span className={cn(
                  'text-sm font-semibold shrink-0',
                  item.type === 'asset' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {item.type === 'asset' ? '+' : '-'}{formatCurrency(item.value, true)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

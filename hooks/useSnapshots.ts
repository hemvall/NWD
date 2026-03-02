'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { NetWorthSnapshot, AssetDetails, LiabilityDetails } from '@/lib/types'
import { todayISO } from '@/lib/utils'

async function fetchSnapshots(): Promise<NetWorthSnapshot[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: true })
    .limit(120)
  if (error) throw error
  return data ?? []
}

export function useSnapshots() {
  const { data, error, isLoading, mutate } = useSWR<NetWorthSnapshot[]>('snapshots', fetchSnapshots)

  async function upsertTodaySnapshot(totalAssets: number, totalLiabilities: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const netWorth = totalAssets - totalLiabilities
    const { error } = await supabase.from('net_worth_snapshots').upsert(
      {
        user_id: user.id,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        snapshot_date: todayISO(),
      },
      { onConflict: 'user_id,snapshot_date' }
    )
    if (error) console.error('Snapshot upsert error:', error)
    else await mutate()
  }

  async function upsertSnapshot(
    date: string,
    totalAssets: number,
    totalLiabilities: number,
    assetDetails?: AssetDetails,
    liabilityDetails?: LiabilityDetails,
  ) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const netWorth = totalAssets - totalLiabilities
    const { error } = await supabase.from('net_worth_snapshots').upsert(
      {
        user_id: user.id,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        snapshot_date: date,
        ...(assetDetails ? { asset_details: assetDetails } : {}),
        ...(liabilityDetails ? { liability_details: liabilityDetails } : {}),
      },
      { onConflict: 'user_id,snapshot_date' }
    )
    if (error) throw error
    await mutate()
  }

  async function deleteSnapshot(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('net_worth_snapshots').delete().eq('id', id)
    if (error) throw error
    await mutate()
  }

  return { snapshots: data ?? [], isLoading, error, upsertTodaySnapshot, upsertSnapshot, deleteSnapshot }
}

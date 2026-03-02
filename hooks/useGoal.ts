'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Goal } from '@/lib/types'

async function fetchGoal(): Promise<Goal | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export function useGoal() {
  const { data, error, isLoading, mutate } = useSWR<Goal | null>('goal', fetchGoal)

  async function saveGoal(targetNetWorth: number, targetDate?: string, label?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    if (data?.id) {
      const { error } = await supabase.from('goals').update({
        target_net_worth: targetNetWorth,
        target_date: targetDate || null,
        label: label || null,
      }).eq('id', data.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        target_net_worth: targetNetWorth,
        target_date: targetDate || null,
        label: label || null,
      })
      if (error) throw error
    }
    await mutate()
  }

  async function deleteGoal() {
    if (!data?.id) return
    const supabase = createClient()
    const { error } = await supabase.from('goals').delete().eq('id', data.id)
    if (error) throw error
    await mutate()
  }

  return { goal: data ?? null, isLoading, error, saveGoal, deleteGoal }
}

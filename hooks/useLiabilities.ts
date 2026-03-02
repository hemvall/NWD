'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Liability, LiabilityFormData } from '@/lib/types'

async function fetchLiabilities(): Promise<Liability[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useLiabilities() {
  const { data, error, isLoading, mutate } = useSWR<Liability[]>('liabilities', fetchLiabilities)

  async function addLiability(form: LiabilityFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('liabilities').insert({
      user_id: user.id,
      name: form.name,
      category: form.category,
      value: parseFloat(form.value),
      notes: form.notes || null,
    })
    if (error) throw error
    await mutate()
  }

  async function updateLiability(id: string, form: Partial<LiabilityFormData>) {
    const supabase = createClient()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (form.name !== undefined) payload.name = form.name
    if (form.category !== undefined) payload.category = form.category
    if (form.value !== undefined) payload.value = parseFloat(form.value)
    if (form.notes !== undefined) payload.notes = form.notes || null
    const { error } = await supabase.from('liabilities').update(payload).eq('id', id)
    if (error) throw error
    await mutate()
  }

  async function deleteLiability(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('liabilities').delete().eq('id', id)
    if (error) throw error
    await mutate()
  }

  const totalLiabilities = (data ?? []).reduce((sum, l) => sum + l.value, 0)

  return { liabilities: data ?? [], totalLiabilities, isLoading, error, addLiability, updateLiability, deleteLiability, mutate }
}

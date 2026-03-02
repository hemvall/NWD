'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Asset, AssetFormData } from '@/lib/types'

async function fetchAssets(): Promise<Asset[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useAssets() {
  const { data, error, isLoading, mutate } = useSWR<Asset[]>('assets', fetchAssets)

  async function addAsset(form: AssetFormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('assets').insert({
      user_id: user.id,
      name: form.name,
      category: form.category,
      value: parseFloat(form.value),
      notes: form.notes || null,
    })
    if (error) throw error
    await mutate()
  }

  async function updateAsset(id: string, form: Partial<AssetFormData>) {
    const supabase = createClient()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (form.name !== undefined) payload.name = form.name
    if (form.category !== undefined) payload.category = form.category
    if (form.value !== undefined) payload.value = parseFloat(form.value)
    if (form.notes !== undefined) payload.notes = form.notes || null
    const { error } = await supabase.from('assets').update(payload).eq('id', id)
    if (error) throw error
    await mutate()
  }

  async function deleteAsset(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('assets').delete().eq('id', id)
    if (error) throw error
    await mutate()
  }

  const totalAssets = (data ?? []).reduce((sum, a) => sum + a.value, 0)

  return { assets: data ?? [], totalAssets, isLoading, error, addAsset, updateAsset, deleteAsset, mutate }
}

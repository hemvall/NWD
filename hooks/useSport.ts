'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { SportProfile, BodyEntry, LiftEntry, LiftKey, WorkoutEntry, WorkoutType } from '@/lib/sport'

const EMPTY_BODY: BodyEntry[] = []
const EMPTY_LIFTS: LiftEntry[] = []
const EMPTY_WORKOUTS: WorkoutEntry[] = []

// ── Row ⇄ domain mappers ──────────────────────────────────────────────────

type ProfileRow = {
  name: string
  gender: SportProfile['gender']
  age: number
  height_cm: number
  weight_kg: number
  experience: SportProfile['experience']
  activity: SportProfile['activity']
  phase: SportProfile['phase']
  objective: SportProfile['objective']
  target_weight_kg: number | null
  lift_targets: Partial<Record<LiftKey, number | null>> | null
  calorie_override: number | null
  created_at: string
}

function rowToProfile(r: ProfileRow): SportProfile {
  return {
    name: r.name,
    gender: r.gender,
    age: r.age,
    heightCm: r.height_cm,
    weightKg: r.weight_kg,
    experience: r.experience,
    activity: r.activity,
    phase: r.phase,
    objective: r.objective,
    targetWeightKg: r.target_weight_kg,
    liftTargets: r.lift_targets ?? undefined,
    calorieOverride: r.calorie_override,
    createdAt: r.created_at,
  }
}

function profileToRow(p: SportProfile) {
  return {
    name: p.name,
    gender: p.gender,
    age: p.age,
    height_cm: p.heightCm,
    weight_kg: p.weightKg,
    experience: p.experience,
    activity: p.activity,
    phase: p.phase,
    objective: p.objective,
    target_weight_kg: p.targetWeightKg ?? null,
    lift_targets: p.liftTargets ?? null,
    calorie_override: p.calorieOverride ?? null,
  }
}

// ── Profile ───────────────────────────────────────────────────────────────

async function fetchProfile(): Promise<SportProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sport_profiles')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? rowToProfile(data as ProfileRow) : null
}

export function useSportProfile() {
  const { data, isLoading, mutate } = useSWR<SportProfile | null>('sport_profile', fetchProfile)
  const profile = data ?? null

  async function saveProfile(value: SportProfile) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('sport_profiles').upsert(
      { user_id: user.id, ...profileToRow(value), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    await mutate()
  }

  async function updateProfile(patch: Partial<SportProfile>) {
    if (!profile) return
    await saveProfile({ ...profile, ...patch })
  }

  async function resetProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Wipe the whole gym section for this user.
    await Promise.all([
      supabase.from('sport_lifts').delete().eq('user_id', user.id),
      supabase.from('sport_body_entries').delete().eq('user_id', user.id),
      supabase.from('sport_profiles').delete().eq('user_id', user.id),
    ])
    await mutate(null)
  }

  return { profile, isLoading, saveProfile, updateProfile, resetProfile }
}

// ── Body-weight log ───────────────────────────────────────────────────────

async function fetchBody(): Promise<BodyEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sport_body_entries')
    .select('*')
    .order('entry_date', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({ id: r.id, date: r.entry_date, weightKg: r.weight_kg }))
}

export function useBodyLog() {
  const { data, isLoading, mutate } = useSWR<BodyEntry[]>('sport_body', fetchBody)
  const entries = data ?? EMPTY_BODY

  async function addEntry(date: string, weightKg: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    // One entry per date — upsert replaces an existing weigh-in for that day.
    const { error } = await supabase.from('sport_body_entries').upsert(
      { user_id: user.id, entry_date: date, weight_kg: weightKg },
      { onConflict: 'user_id,entry_date' },
    )
    if (error) throw error
    await mutate()
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('sport_body_entries').delete().eq('id', id)
    if (error) throw error
    await mutate()
  }

  return { entries, isLoading, addEntry, deleteEntry }
}

// ── Lift log ──────────────────────────────────────────────────────────────

async function fetchLifts(): Promise<LiftEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sport_lifts')
    .select('*')
    .order('lift_date', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    date: r.lift_date,
    lift: r.lift as LiftKey,
    weightKg: r.weight_kg,
    reps: r.reps,
    sets: r.sets ?? 1,
  }))
}

export function useLiftLog() {
  const { data, isLoading, mutate } = useSWR<LiftEntry[]>('sport_lifts', fetchLifts)
  const entries = data ?? EMPTY_LIFTS

  async function addEntry(entry: Omit<LiftEntry, 'id'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('sport_lifts').insert({
      user_id: user.id,
      lift_date: entry.date,
      lift: entry.lift,
      weight_kg: entry.weightKg,
      reps: entry.reps,
      sets: entry.sets,
    })
    if (error) throw error
    await mutate()
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('sport_lifts').delete().eq('id', id)
    if (error) throw error
    await mutate()
  }

  return { entries, isLoading, addEntry, deleteEntry }
}

// ── Workout calendar (one workout per day) ────────────────────────────────

async function fetchWorkouts(): Promise<WorkoutEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sport_workouts')
    .select('*')
    .order('workout_date', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({ id: r.id, date: r.workout_date, type: r.type as WorkoutType }))
}

export function useWorkoutLog() {
  const { data, isLoading, mutate } = useSWR<WorkoutEntry[]>('sport_workouts', fetchWorkouts)
  const entries = data ?? EMPTY_WORKOUTS

  async function setWorkout(date: string, type: WorkoutType) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    // One workout per day — upsert replaces the day's type.
    const { error } = await supabase.from('sport_workouts').upsert(
      { user_id: user.id, workout_date: date, type },
      { onConflict: 'user_id,workout_date' },
    )
    if (error) throw error
    await mutate()
  }

  async function removeWorkout(date: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('sport_workouts')
      .delete()
      .eq('user_id', user.id)
      .eq('workout_date', date)
    if (error) throw error
    await mutate()
  }

  return { entries, isLoading, setWorkout, removeWorkout }
}

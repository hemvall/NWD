'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { SportProfile, BodyEntry, LiftEntry } from '@/lib/sport'

const PROFILE_KEY = 'nwd_sport_profile'
const BODY_KEY = 'nwd_sport_body'
const LIFT_KEY = 'nwd_sport_lifts'

const EMPTY_BODY: BodyEntry[] = []
const EMPTY_LIFTS: LiftEntry[] = []

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

// ── Minimal localStorage-backed external store (SSR-safe) ──

const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, { raw: string | null; value: unknown }>()
const SERVER = Symbol('server-snapshot')

function emit(key: string) {
  listeners.get(key)?.forEach(l => l())
}

function subscribe(key: string, cb: () => void): () => void {
  let set = listeners.get(key)
  if (!set) {
    set = new Set()
    listeners.set(key, set)
  }
  set.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      cache.delete(key)
      cb()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    set!.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

/** Returns a cached (stable) parsed value so useSyncExternalStore doesn't loop. */
function readSnapshot<T>(key: string, fallback: T): T {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value as T
  let value: T
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    value = fallback
  }
  cache.set(key, { raw, value })
  return value
}

function writeLocal<T>(key: string, value: T | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable
  }
  cache.delete(key)
  emit(key)
}

function useLocalStore<T>(key: string, fallback: T) {
  const raw = useSyncExternalStore(
    useCallback(cb => subscribe(key, cb), [key]),
    useCallback(() => readSnapshot(key, fallback), [key, fallback]),
    () => SERVER as unknown as T,
  )
  const isLoading = raw === (SERVER as unknown as T)
  const value = isLoading ? fallback : raw
  const set = useCallback((v: T | null) => writeLocal(key, v), [key])
  return { value, isLoading, set }
}

// ── Public hooks ──

export function useSportProfile() {
  const { value: profile, isLoading, set } = useLocalStore<SportProfile | null>(PROFILE_KEY, null)

  const saveProfile = useCallback((value: SportProfile) => set(value), [set])

  const updateProfile = useCallback(
    (patch: Partial<SportProfile>) => {
      if (!profile) return
      set({ ...profile, ...patch })
    },
    [set, profile],
  )

  const resetProfile = useCallback(() => set(null), [set])

  return { profile, isLoading, saveProfile, updateProfile, resetProfile }
}

export function useBodyLog() {
  const { value: entries, isLoading, set } = useLocalStore<BodyEntry[]>(BODY_KEY, EMPTY_BODY)

  const addEntry = useCallback(
    (date: string, weightKg: number) => {
      // One entry per date — replace if it already exists.
      const next = [...entries.filter(e => e.date !== date), { id: newId(), date, weightKg }]
        .sort((a, b) => a.date.localeCompare(b.date))
      set(next)
    },
    [entries, set],
  )

  const deleteEntry = useCallback(
    (id: string) => set(entries.filter(e => e.id !== id)),
    [entries, set],
  )

  return { entries, isLoading, addEntry, deleteEntry }
}

export function useLiftLog() {
  const { value: entries, isLoading, set } = useLocalStore<LiftEntry[]>(LIFT_KEY, EMPTY_LIFTS)

  const addEntry = useCallback(
    (entry: Omit<LiftEntry, 'id'>) => {
      const next = [...entries, { ...entry, id: newId() }].sort((a, b) => a.date.localeCompare(b.date))
      set(next)
    },
    [entries, set],
  )

  const deleteEntry = useCallback(
    (id: string) => set(entries.filter(e => e.id !== id)),
    [entries, set],
  )

  return { entries, isLoading, addEntry, deleteEntry }
}

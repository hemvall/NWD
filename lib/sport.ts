// Gym module — types + fitness calculations. Pure, no side effects.

export type Gender = 'homme' | 'femme' | 'autre'
export type Experience = 'debutant' | 'intermediaire' | 'avance'
export type Activity = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif'
export type Phase = 'bulk' | 'cut' | 'maintain'
export type SportObjective = 'prise_de_masse' | 'seche' | 'maintien' | 'force'
export type LiftKey =
  | 'dc_halteres'
  | 'tirage_vertical'
  | 'tractions'
  | 'dips'
  | 'chest_press'
  | 'curl_biceps'
  | 'skull_crusher'
  | 'elevations_laterales'

export interface SportProfile {
  name: string
  gender: Gender
  age: number
  heightCm: number
  weightKg: number // current body weight
  experience: Experience
  activity: Activity
  phase: Phase
  objective: SportObjective
  // Goals
  targetWeightKg?: number | null
  liftTargets?: Partial<Record<LiftKey, number | null>>
  // Manual calorie override (otherwise auto from TDEE + phase)
  calorieOverride?: number | null
  createdAt: string
}

export interface BodyEntry {
  id: string
  date: string // YYYY-MM-DD
  weightKg: number
}

export interface LiftEntry {
  id: string
  date: string
  lift: LiftKey
  weightKg: number
  reps: number
  sets: number // number of sets performed in this logged entry
}

// ── Workout calendar (Push / Pull / Legs / Arms split) ──

export type WorkoutType = 'push' | 'pull' | 'legs' | 'arms' | 'full' | 'cardio'

export interface WorkoutEntry {
  id: string
  date: string // YYYY-MM-DD — one workout per day
  type: WorkoutType
}

export const WORKOUTS: Record<WorkoutType, { label: string; short: string; color: string }> = {
  push: { label: 'Push (pecs · épaules · triceps)', short: 'Push', color: '#34d399' },
  pull: { label: 'Pull (dos · biceps)', short: 'Pull', color: '#22d3ee' },
  legs: { label: 'Legs (jambes)', short: 'Legs', color: '#a78bfa' },
  arms: { label: 'Arms (bras)', short: 'Arms', color: '#f59e0b' },
  full: { label: 'Full body', short: 'Full', color: '#f472b6' },
  cardio: { label: 'Cardio', short: 'Cardio', color: '#38bdf8' },
}

export const WORKOUT_KEYS = Object.keys(WORKOUTS) as WorkoutType[]

// ── Reference data ──

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
]

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: 'debutant', label: 'Débutant (< 1 an)' },
  { value: 'intermediaire', label: 'Intermédiaire (1-3 ans)' },
  { value: 'avance', label: 'Avancé (3 ans +)' },
]

export const ACTIVITIES: { value: Activity; label: string; factor: number }[] = [
  { value: 'sedentaire', label: 'Sédentaire (peu/pas de sport)', factor: 1.2 },
  { value: 'leger', label: 'Léger (1-2 séances/sem)', factor: 1.375 },
  { value: 'modere', label: 'Modéré (3-4 séances/sem)', factor: 1.55 },
  { value: 'actif', label: 'Actif (5-6 séances/sem)', factor: 1.725 },
  { value: 'tres_actif', label: 'Très actif (2x/jour)', factor: 1.9 },
]

export const OBJECTIVES: { value: SportObjective; label: string }[] = [
  { value: 'prise_de_masse', label: 'Prise de masse' },
  { value: 'seche', label: 'Sèche / perte de gras' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'force', label: 'Gain de force' },
]

export const PHASES: Record<Phase, { label: string; color: string; desc: string }> = {
  bulk: { label: 'Prise de masse', color: '#34d399', desc: 'Surplus calorique (+10 %)' },
  cut: { label: 'Sèche', color: '#f472b6', desc: 'Déficit calorique (-20 %)' },
  maintain: { label: 'Maintien', color: '#22d3ee', desc: 'Maintenance calorique' },
}

export const LIFTS: Record<LiftKey, { label: string; short: string }> = {
  dc_halteres: { label: 'Développé couché haltères', short: 'DC Halt.' },
  tirage_vertical: { label: 'Tirage vertical', short: 'Tirage V.' },
  tractions: { label: 'Tractions', short: 'Tractions' },
  dips: { label: 'Dips', short: 'Dips' },
  chest_press: { label: 'Pec Fly', short: 'Pec F.' },
  curl_biceps: { label: 'Curl biceps', short: 'Curl' },
  skull_crusher: { label: 'Skull crusher haltère', short: 'Skull C.' },
  elevations_laterales: { label: 'Élévations latérales', short: 'Élév. Lat.' },
}

export const LIFT_KEYS = Object.keys(LIFTS) as LiftKey[]

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentaire: 1.2, leger: 1.375, modere: 1.55, actif: 1.725, tres_actif: 1.9,
}

// ── Calculations ──

export function bmi(p: SportProfile): number {
  const m = p.heightCm / 100
  return m > 0 ? p.weightKg / (m * m) : 0
}

export function bmiLabel(value: number): { label: string; color: string } {
  if (value < 18.5) return { label: 'Insuffisant', color: '#22d3ee' }
  if (value < 25) return { label: 'Normal', color: '#34d399' }
  if (value < 30) return { label: 'Surpoids', color: '#f59e0b' }
  return { label: 'Obésité', color: '#f472b6' }
}

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmr(p: SportProfile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  if (p.gender === 'homme') return base + 5
  if (p.gender === 'femme') return base - 161
  return base - 78 // average of the two
}

/** Total daily energy expenditure (kcal/day). */
export function tdee(p: SportProfile): number {
  return bmr(p) * ACTIVITY_FACTOR[p.activity]
}

export function calorieTarget(p: SportProfile): number {
  if (p.calorieOverride && p.calorieOverride > 0) return p.calorieOverride
  const t = tdee(p)
  const mult = p.phase === 'bulk' ? 1.1 : p.phase === 'cut' ? 0.8 : 1
  return Math.round((t * mult) / 10) * 10
}

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function macros(p: SportProfile): Macros {
  const calories = calorieTarget(p)
  const protein = Math.round((p.phase === 'cut' ? 2.2 : 2.0) * p.weightKg)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { calories, protein, carbs, fat }
}

export function formatKg(value: number): string {
  return `${Math.round(value * 10) / 10} kg`
}

/** Total tonnage of a logged entry (load × reps × sets). Bodyweight moves use the body weight. */
export function setVolume(e: LiftEntry, bodyWeightKg = 0): number {
  const load = e.weightKg > 0 ? e.weightKg : bodyWeightKg
  return load * e.reps * (e.sets ?? 1)
}

/** Heaviest weight ever logged for an exercise. */
export function bestWeight(entries: LiftEntry[], lift: LiftKey): number {
  return entries.filter(e => e.lift === lift).reduce((m, e) => Math.max(m, e.weightKg), 0)
}

/** Best single set for an exercise (by tonnage) — the "record". */
export function bestSet(entries: LiftEntry[], lift: LiftKey, bodyWeightKg = 0): LiftEntry | null {
  return entries
    .filter(e => e.lift === lift)
    .reduce<LiftEntry | null>(
      (best, e) => (!best || setVolume(e, bodyWeightKg) > setVolume(best, bodyWeightKg) ? e : best),
      null,
    )
}

/** Distinct training days logged. */
export function workoutSessions(lifts: LiftEntry[]): number {
  return new Set(lifts.map(e => e.date)).size
}

/**
 * Estimated working strength of a set (kg). Used only for the internal strength
 * rating (not shown as a "1RM"). Reps are capped so high-rep sets don't inflate it.
 * Bodyweight moves (no added load) use the body weight as the load.
 */
export function estStrength(e: LiftEntry, bodyWeightKg = 0): number {
  const load = e.weightKg > 0 ? e.weightKg : bodyWeightKg
  const reps = Math.min(e.reps, 15)
  return load * (1 + reps / 30)
}

/** Best estimated strength for one exercise. */
export function bestStrength(entries: LiftEntry[], lift: LiftKey, bodyWeightKg = 0): number {
  return entries.filter(e => e.lift === lift).reduce((m, e) => Math.max(m, estStrength(e, bodyWeightKg)), 0)
}

/** Current strength rating (kg) — sum of best estimated strength across all exercises. */
export function forceScore(lifts: LiftEntry[], bodyWeightKg = 0): number {
  return LIFT_KEYS.reduce((s, l) => s + bestStrength(lifts, l, bodyWeightKg), 0)
}

// XP economy — kept transparent so progress is easy to understand.
export const XP_RULES = {
  xpPerForceKg: 1, // strength rating: ~1 XP per kg of cumulated estimated strength
  volumeKgPerXp: 1500, // 1 XP per 1500 kg of total volume lifted (the grind)
  xpPerSession: 4, // per distinct workout day
  xpPerWeighIn: 2, // per body-weight entry
  xpPerLevel: 25, // XP needed to gain one level
}

export interface SportProgress {
  level: number
  xp: number
  xpIntoLevel: number
  xpForNext: number
  force: number
  forceXp: number
  totalVolume: number
  volumeXp: number
  sessions: number
  sessionXp: number
  weighIns: number
  weighInXp: number
}

/**
 * Gym progression — strength rating (current) + assiduity XP (volume, sessions, weigh-ins).
 * `sessionDates` are extra training days from the workout calendar; they're unioned with
 * the days that have logged lifts so a calendar entry counts as a session on its own.
 */
export function getSportProgress(
  lifts: LiftEntry[],
  bodyEntries: number,
  bodyWeightKg = 0,
  sessionDates: string[] = [],
): SportProgress {
  const force = forceScore(lifts, bodyWeightKg)
  const totalVolume = lifts.reduce((s, e) => s + setVolume(e, bodyWeightKg), 0)
  const sessions = new Set([...lifts.map(e => e.date), ...sessionDates]).size

  const forceXp = Math.round(force * XP_RULES.xpPerForceKg)
  const volumeXp = Math.floor(totalVolume / XP_RULES.volumeKgPerXp)
  const sessionXp = sessions * XP_RULES.xpPerSession
  const weighInXp = bodyEntries * XP_RULES.xpPerWeighIn

  const xp = forceXp + volumeXp + sessionXp + weighInXp
  const level = Math.floor(xp / XP_RULES.xpPerLevel) + 1
  return {
    level,
    xp,
    xpIntoLevel: xp % XP_RULES.xpPerLevel,
    xpForNext: XP_RULES.xpPerLevel - (xp % XP_RULES.xpPerLevel),
    force,
    forceXp,
    totalVolume,
    volumeXp,
    sessions,
    sessionXp,
    weighIns: bodyEntries,
    weighInXp,
  }
}

export function getSportLevel(
  lifts: LiftEntry[],
  bodyEntries: number,
  bodyWeightKg = 0,
  sessionDates: string[] = [],
): number {
  return getSportProgress(lifts, bodyEntries, bodyWeightKg, sessionDates).level
}

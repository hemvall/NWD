// Solo Leveling "System" gamification helpers — maps real finances onto
// Hunter ranks, levels and EXP. Pure functions, no side effects.

export interface Rank {
  letter: string
  name: string
  color: string
  min: number // net worth (EUR) required to reach this rank
}

// Ordered low → high. `min` is the threshold to enter the rank.
export const RANKS: Rank[] = [
  { letter: 'E', name: 'Éveillé', color: '#94a3b8', min: 10_000 },
  { letter: 'D', name: 'Novice', color: '#22d3ee', min: 25_000 },
  { letter: 'C', name: 'Confirmé', color: '#34d399', min: 35_000 },
  { letter: 'B', name: 'Élite', color: '#a78bfa', min: 50_000 },
  { letter: 'A', name: 'Maître', color: '#f59e0b', min: 100_000 },
  { letter: 'S', name: 'Monarque', color: '#f472b6', min: 250_000 },
  { letter: 'SS', name: 'Souverain', color: '#fb7185', min: 500_000 },
  { letter: 'SSS', name: 'Rang Nation', color: '#e11e3b', min: 1_000_000 },
]

export interface RankInfo {
  current: Rank
  next: Rank | null
  /** progress within the current rank toward the next, 0–100 */
  progress: number
}

export function getRank(netWorth: number): RankInfo {
  const nw = Math.max(0, netWorth)
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) {
    if (nw >= RANKS[i].min) idx = i
  }
  const current = RANKS[idx]
  const next = RANKS[idx + 1] ?? null
  const progress = next
    ? Math.min(100, Math.max(0, ((nw - current.min) / (next.min - current.min)) * 100))
    : 100
  return { current, next, progress }
}

/** A gently diminishing level curve so early gains feel rewarding. */
export function getLevel(netWorth: number): number {
  if (netWorth <= 0) return 1
  return Math.floor(Math.sqrt(netWorth) / 10) + 1
}

// ── Level-based ranks (section-agnostic) ──
// Used by the gym section and by the GLOBAL rank that aggregates every section.

export interface LevelRank {
  letter: string
  name: string
  color: string
  minLevel: number
}

export const LEVEL_RANKS: LevelRank[] = [
  { letter: 'E', name: 'Éveillé', color: '#94a3b8', minLevel: 0 },
  { letter: 'D', name: 'Novice', color: '#22d3ee', minLevel: 8 },
  { letter: 'C', name: 'Confirmé', color: '#34d399', minLevel: 16 },
  { letter: 'B', name: 'Élite', color: '#a78bfa', minLevel: 26 },
  { letter: 'A', name: 'Maître', color: '#f59e0b', minLevel: 40 },
  { letter: 'S', name: 'Monarque', color: '#f472b6', minLevel: 60 },
  { letter: 'SS', name: 'Souverain', color: '#fb7185', minLevel: 85 },
  { letter: 'SSS', name: 'Rang Nation', color: '#e11e3b', minLevel: 120 },
]

export interface LevelRankInfo {
  current: LevelRank
  next: LevelRank | null
  /** progress within the current rank toward the next, 0–100 */
  progress: number
}

export function getRankByLevel(level: number): LevelRankInfo {
  const lvl = Math.max(0, level)
  let idx = 0
  for (let i = 0; i < LEVEL_RANKS.length; i++) {
    if (lvl >= LEVEL_RANKS[i].minLevel) idx = i
  }
  const current = LEVEL_RANKS[idx]
  const next = LEVEL_RANKS[idx + 1] ?? null
  const progress = next
    ? Math.min(100, Math.max(0, ((lvl - current.minLevel) / (next.minLevel - current.minLevel)) * 100))
    : 100
  return { current, next, progress }
}

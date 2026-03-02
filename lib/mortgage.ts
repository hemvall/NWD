export interface MortgageParams {
  amount: number    // capital initial (€)
  rate: number      // taux annuel (%)
  months: number    // durée totale (mois)
  startDate: string // YYYY-MM
}

export interface MortgageResult {
  remaining: number   // capital restant dû
  monthly: number     // mensualité
  monthsLeft: number  // mois restants
  monthsElapsed: number
  progress: number    // % remboursé (0-100)
}

export const MTG_PREFIX = '__mtg__'

export function computeMortgage(p: MortgageParams): MortgageResult {
  const r = p.rate / 100 / 12
  const [startYear, startMonth] = p.startDate.split('-').map(Number)
  const now = new Date()
  const k = Math.max(0, (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth))

  if (k >= p.months) {
    return { remaining: 0, monthly: 0, monthsLeft: 0, monthsElapsed: p.months, progress: 100 }
  }

  const monthly = r === 0
    ? p.amount / p.months
    : (r * p.amount * Math.pow(1 + r, p.months)) / (Math.pow(1 + r, p.months) - 1)

  const remaining = r === 0
    ? p.amount - monthly * k
    : p.amount * Math.pow(1 + r, k) - monthly * (Math.pow(1 + r, k) - 1) / r

  const monthsLeft = p.months - k

  return {
    remaining: Math.max(0, Math.round(remaining)),
    monthly: Math.round(monthly),
    monthsLeft,
    monthsElapsed: k,
    progress: Math.round((k / p.months) * 100),
  }
}

export function encodeMortgageNotes(p: MortgageParams): string {
  return MTG_PREFIX + JSON.stringify(p)
}

export function parseMortgageNotes(notes: string | null | undefined): MortgageParams | null {
  if (!notes?.startsWith(MTG_PREFIX)) return null
  try {
    return JSON.parse(notes.slice(MTG_PREFIX.length)) as MortgageParams
  } catch {
    return null
  }
}

export function formatMonthsLeft(monthsLeft: number): string {
  if (monthsLeft <= 0) return 'Terminé'
  const years = Math.floor(monthsLeft / 12)
  const months = monthsLeft % 12
  if (years === 0) return `${months} mois`
  if (months === 0) return `${years} an${years > 1 ? 's' : ''}`
  return `${years} an${years > 1 ? 's' : ''} ${months} mois`
}

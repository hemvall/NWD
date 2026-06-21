'use client'

import { useMemo } from 'react'
import { Check, Lock, ScrollText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { NetWorthSnapshot, Goal } from '@/lib/types'

interface Props {
  netWorth: number
  snapshots: NetWorthSnapshot[]
  goal: Goal | null
  isLoading: boolean
}

type Category = 'Patrimoine' | 'Constance' | 'Actifs' | 'Passifs'

const CATEGORY_ORDER: Category[] = ['Patrimoine', 'Constance', 'Actifs', 'Passifs']

interface Quest {
  title: string
  hint: string
  done: boolean
  /** 0–100 progress toward completion */
  progress: number
  category: Category
}

/** Trailing run of consecutive months with a positive net-worth change. */
function savingsStreak(snapshots: NetWorthSnapshot[]): number {
  let streak = 0
  for (let i = snapshots.length - 1; i >= 1; i--) {
    if (snapshots[i].net_worth - snapshots[i - 1].net_worth > 0) streak++
    else break
  }
  return streak
}

/** Largest single-month net-worth gain across the history. */
function bestMonthGain(snapshots: NetWorthSnapshot[]): number {
  let best = 0
  for (let i = 1; i < snapshots.length; i++) {
    best = Math.max(best, snapshots[i].net_worth - snapshots[i - 1].net_worth)
  }
  return best
}

/** Number of distinct asset categories that hold value in the latest snapshot. */
function assetSpread(latest: NetWorthSnapshot | null): number {
  const d = latest?.asset_details
  if (!d) return 0
  return Object.values(d).filter(v => typeof v === 'number' && v > 0).length
}

// Quest helpers: a threshold quest grows a progress bar toward `threshold`.
function threshold(
  category: Category,
  title: string,
  hint: string,
  value: number,
  target: number,
): Quest {
  return {
    category,
    title,
    hint,
    done: value >= target,
    progress: target > 0 ? Math.min(100, (value / target) * 100) : value > 0 ? 100 : 0,
  }
}

function boolean(
  category: Category,
  title: string,
  hint: string,
  done: boolean,
  progress?: number,
): Quest {
  return { category, title, hint, done, progress: done ? 100 : progress ?? 0 }
}

function buildQuests(netWorth: number, snapshots: NetWorthSnapshot[], goal: Goal | null): Quest[] {
  const streak = savingsStreak(snapshots)
  const records = snapshots.length
  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
  const first = snapshots.length > 0 ? snapshots[0] : null
  const bestGain = bestMonthGain(snapshots)
  const spread = assetSpread(latest)
  const doubled = !!first && first.net_worth > 0 && netWorth >= 2 * first.net_worth
  const growthSinceStart = first && first.net_worth > 0 ? netWorth - first.net_worth : 0

  // Per-type detail from the latest snapshot (French keys).
  const a = latest?.asset_details
  const l = latest?.liability_details
  const immobilier = a?.immobilier ?? 0
  const cto = a?.cto ?? 0
  const livrets = a?.livrets ?? 0
  const cryptos = a?.cryptos ?? 0
  const collection = (a?.montres ?? 0) + (a?.cartesPokemon ?? 0) + (a?.jeuxPokemon ?? 0)
  const totalAssetsSnap = latest?.total_assets ?? 0
  const immoRatio = totalAssetsSnap > 0 ? (immobilier / totalAssetsSnap) * 100 : 0

  const creditImmo = l?.creditImmobilier ?? 0
  const creditConso = l?.creditConsommation ?? 0
  const cartesCredit = l?.cartesCredit ?? 0

  const quests: Quest[] = [
    // ── Patrimoine global ──
    boolean('Patrimoine', 'Premier Capital', 'Atteindre un patrimoine net positif', netWorth > 0),
    threshold('Patrimoine', 'Cinq Chiffres', 'Franchir la barre des 10 000 €', netWorth, 10_000),
    threshold('Patrimoine', 'Patrimoine à Six Chiffres', 'Franchir la barre des 100 000 €', netWorth, 100_000),
    threshold('Patrimoine', 'Quart de Million', 'Franchir la barre des 250 000 €', netWorth, 250_000),
    boolean('Patrimoine', 'Effet Boule de Neige', 'Doubler son patrimoine de départ', doubled,
      first && first.net_worth > 0 ? Math.min(100, (growthSinceStart / first.net_worth) * 100) : 0),

    // ── Constance & discipline ──
    threshold('Constance', 'Discipline du Chasseur', '3 mois de hausse consécutifs', streak, 3),
    threshold('Constance', 'Marche Forcée', '6 mois de hausse consécutifs', streak, 6),
    threshold('Constance', 'Mois Record', 'Une hausse mensuelle de +5 000 €', bestGain, 5_000),
    threshold('Constance', 'Archiviste', '12 relevés enregistrés', records, 12),

    // ── Actifs par type ──
    boolean('Actifs', 'Première Pierre', 'Acquérir un premier bien immobilier', immobilier > 0,
      immobilier > 0 ? 100 : 0),
    threshold('Actifs', 'Bailleur', "Détenir 150 000 € d'immobilier", immobilier, 150_000),
    threshold('Actifs', 'Magnat de la Pierre', "Détenir 300 000 € d'immobilier", immobilier, 300_000),
    boolean('Actifs', 'Propriétaire Net', "La valeur du bien dépasse le crédit restant",
      immobilier > 0 && immobilier > creditImmo,
      creditImmo > 0 ? Math.min(100, (immobilier / creditImmo) * 100) : immobilier > 0 ? 100 : 0),
    threshold('Actifs', 'Pilier de Pierre', "L'immobilier pèse 40 % des actifs", immoRatio, 40),
    threshold('Actifs', 'Portefeuille Boursier', 'Détenir 50 000 € en bourse (CTO)', cto, 50_000),
    threshold('Actifs', 'Bas de Laine', 'Constituer 15 000 € sur les livrets', livrets, 15_000),
    threshold('Actifs', 'Trésor Numérique', 'Détenir 10 000 € en cryptos', cryptos, 10_000),
    threshold('Actifs', 'Collectionneur', '5 000 € de collection (montres, cartes…)', collection, 5_000),
    threshold('Actifs', 'Arsenal Diversifié', '4 catégories d’actifs investies', spread, 4),

    // ── Passifs & désendettement ──
    boolean('Passifs', 'Sans Chaînes', 'Aucun passif en cours', !!latest && latest.total_liabilities <= 0),
    boolean('Passifs', 'Crédit Conso Soldé', 'Rembourser tout crédit à la consommation', !!latest && creditConso <= 0),
    boolean('Passifs', 'Cartes Soldées', 'Aucun encours de carte de crédit', !!latest && cartesCredit <= 0),
    boolean('Passifs', 'Désendettement', 'Réduire ses passifs vs le premier relevé',
      !!first && !!latest && first.total_liabilities > 0 && latest.total_liabilities < first.total_liabilities,
      first && first.total_liabilities > 0 && latest
        ? Math.min(100, ((first.total_liabilities - latest.total_liabilities) / first.total_liabilities) * 100)
        : 0),
    boolean('Passifs', 'Liberté de la Pierre', 'Solder entièrement le crédit immobilier',
      !!latest && immobilier > 0 && creditImmo <= 0,
      immobilier > 0 && first && (first.liability_details?.creditImmobilier ?? 0) > 0
        ? Math.min(100, (1 - creditImmo / (first.liability_details?.creditImmobilier ?? 1)) * 100)
        : 0),
  ]

  if (goal && goal.target_net_worth > 0) {
    const ratio = netWorth / goal.target_net_worth
    quests.push(boolean('Patrimoine', 'Objectif en Vue', 'Atteindre 50 % de la quête principale',
      ratio >= 0.5, Math.min(100, (ratio / 0.5) * 100)))
    quests.push(boolean('Patrimoine', 'Quête Accomplie', `Atteindre ${formatCurrency(goal.target_net_worth, true)}`,
      ratio >= 1, Math.min(100, ratio * 100)))
  }

  return quests
}

function QuestRow({ q }: { q: Quest }) {
  return (
    <div
      className="relative flex items-center gap-3 px-3 py-2.5 border transition-colors"
      style={{
        borderColor: q.done ? 'rgba(52,211,153,0.3)' : 'rgba(56,189,248,0.12)',
        background: q.done ? 'rgba(52,211,153,0.06)' : 'rgba(125,211,252,0.02)',
      }}
    >
      <div
        className="flex items-center justify-center h-6 w-6 shrink-0 border"
        style={{
          borderColor: q.done ? 'rgba(52,211,153,0.5)' : 'rgba(56,189,248,0.25)',
          background: q.done ? 'rgba(52,211,153,0.15)' : 'transparent',
          boxShadow: q.done ? '0 0 10px rgba(52,211,153,0.4)' : 'none',
        }}
      >
        {q.done
          ? <Check className="h-3.5 w-3.5 text-emerald-300" />
          : <Lock className="h-3 w-3 text-cyan-100/30" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-xs font-mono font-medium truncate ${q.done ? 'text-emerald-200' : 'text-cyan-100/70'}`}>
          {q.title}
        </p>
        <p className="text-[10px] font-mono text-cyan-100/30 truncate">{q.hint}</p>
        {!q.done && (
          <div className="mt-1.5 h-[3px] bg-cyan-400/10 overflow-hidden">
            <div
              className="h-full bg-cyan-400/60 transition-all duration-700"
              style={{ width: `${q.progress}%`, boxShadow: '0 0 6px rgba(34,211,238,0.5)' }}
            />
          </div>
        )}
      </div>

      {q.done && (
        <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-300/70 shrink-0">
          Clear
        </span>
      )}
    </div>
  )
}

export default function QuestLog({ netWorth, snapshots, goal, isLoading }: Props) {
  const quests = useMemo(
    () => buildQuests(netWorth, snapshots, goal),
    [netWorth, snapshots, goal]
  )

  if (isLoading) {
    return <div className="h-48 glass-card animate-pulse" />
  }

  const completed = quests.filter(q => q.done).length

  // Within a category: in-progress first (closest to done first), cleared last.
  const sortQuests = (list: Quest[]) =>
    [...list].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return b.progress - a.progress
    })

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Quêtes</h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-100/50 border border-cyan-400/20 px-2 py-0.5">
          {completed} / {quests.length} accomplies
        </span>
      </div>

      <div className="space-y-5">
        {CATEGORY_ORDER.map(cat => {
          const inCat = quests.filter(q => q.category === cat)
          if (inCat.length === 0) return null
          const doneInCat = inCat.filter(q => q.done).length
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-400/60 text-[9px]">▸</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200/60">{cat}</span>
                <span className="text-[9px] font-mono text-cyan-100/30">{doneInCat}/{inCat.length}</span>
                <div className="flex-1 h-px bg-cyan-400/10" />
              </div>
              <div className="space-y-2">
                {sortQuests(inCat).map(q => <QuestRow key={q.title} q={q} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, isSameMonth,
  addMonths, subMonths, getDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { WORKOUTS, WORKOUT_KEYS, type WorkoutEntry, type WorkoutType } from '@/lib/sport'

interface Props {
  entries: WorkoutEntry[]
  onSet: (date: string, type: WorkoutType) => void
  onRemove: (date: string) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// date-fns getDay: 0 = Sunday … 6 = Saturday. We want Monday-first columns.
function mondayIndex(d: Date): number {
  return (getDay(d) + 6) % 7
}

export default function WorkoutCalendar({ entries, onSet, onRemove }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const m = new Map<string, WorkoutType>()
    for (const e of entries) m.set(e.date, e.type)
    return m
  }, [entries])

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) }),
    [cursor],
  )
  const leadingBlanks = mondayIndex(startOfMonth(cursor))

  // Per-type tally for the displayed month.
  const monthCounts = useMemo(() => {
    const counts = {} as Record<WorkoutType, number>
    for (const e of entries) {
      const d = new Date(e.date)
      if (isSameMonth(d, cursor)) counts[e.type] = (counts[e.type] ?? 0) + 1
    }
    return counts
  }, [entries, cursor])

  const selectedType = selected ? byDate.get(selected) : undefined

  return (
    <div className="glass-card p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Calendrier des séances</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(c => subMonths(c, 1))}
            className="p-1 border border-cyan-400/20 text-cyan-200/70 hover:bg-cyan-500/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-100/70 w-28 text-center">
            {format(cursor, 'MMMM yyyy', { locale: fr })}
          </span>
          <button onClick={() => setCursor(c => addMonths(c, 1))}
            className="p-1 border border-cyan-400/20 text-cyan-200/70 hover:bg-cyan-500/10 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-mono uppercase tracking-wider text-cyan-100/30 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const iso = format(day, 'yyyy-MM-dd')
          const type = byDate.get(iso)
          const wk = type ? WORKOUTS[type] : null
          const isSel = selected === iso
          return (
            <button
              key={iso}
              onClick={() => setSelected(isSel ? null : iso)}
              className="aspect-square flex flex-col items-center justify-center rounded-sm border text-[10px] font-mono transition-all"
              style={{
                borderColor: isSel ? 'rgba(34,211,238,0.7)' : wk ? `${wk.color}55` : 'rgba(34,211,238,0.1)',
                background: wk ? `${wk.color}1f` : isToday(day) ? 'rgba(34,211,238,0.06)' : 'transparent',
                boxShadow: isSel ? '0 0 10px rgba(34,211,238,0.35)' : undefined,
              }}
            >
              <span className={isToday(day) ? 'text-cyan-200 font-bold' : 'text-cyan-100/60'}>{format(day, 'd')}</span>
              {wk && <span className="text-[8px] leading-none mt-0.5" style={{ color: wk.color }}>{wk.short}</span>}
            </button>
          )
        })}
      </div>

      {/* Day editor */}
      {selected && (
        <div className="mt-4 glass-inner rounded-lg p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono text-cyan-100/70">
              {format(new Date(selected), 'EEEE d MMMM', { locale: fr })}
              {selectedType && <span className="ml-2 text-cyan-100/40">· {WORKOUTS[selectedType].short}</span>}
            </span>
            <button onClick={() => setSelected(null)} className="text-cyan-100/30 hover:text-cyan-200 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WORKOUT_KEYS.map(k => {
              const active = selectedType === k
              return (
                <button
                  key={k}
                  onClick={() => onSet(selected, k)}
                  className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all"
                  style={{
                    color: WORKOUTS[k].color,
                    borderColor: active ? WORKOUTS[k].color : `${WORKOUTS[k].color}40`,
                    background: active ? `${WORKOUTS[k].color}22` : 'transparent',
                  }}
                >
                  {WORKOUTS[k].short}
                </button>
              )
            })}
            {selectedType && (
              <button
                onClick={() => onRemove(selected)}
                className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-pink-400/40 text-pink-300 hover:bg-pink-500/10 transition-all"
              >
                Repos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Month tally */}
      <div className="mt-4 flex flex-wrap gap-2">
        {WORKOUT_KEYS.map(k => (
          <div key={k} className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: WORKOUTS[k].color, boxShadow: `0 0 6px ${WORKOUTS[k].color}88` }} />
            <span className="text-cyan-100/50">{WORKOUTS[k].short}</span>
            <span className="text-cyan-100/30">{monthCounts[k] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Wallet,
  Dumbbell,
  Plane,
  Briefcase,
  BookOpen,
  HeartPulse,
  Lock,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface SystemModule {
  id: string
  label: string
  desc: string
  icon: LucideIcon
  href?: string
  color: string
  available: boolean
}

const MODULES: SystemModule[] = [
  {
    id: 'finance',
    label: 'Finance',
    desc: 'Patrimoine, actifs, passifs & objectifs',
    icon: Wallet,
    href: '/finance',
    color: '#22d3ee',
    available: true,
  },
  {
    id: 'sport',
    label: 'Sport',
    desc: 'Entraînements, performances & santé physique',
    icon: Dumbbell,
    color: '#34d399',
    available: false,
  },
  {
    id: 'voyages',
    label: 'Voyages',
    desc: 'Destinations, aventures & souvenirs',
    icon: Plane,
    color: '#a78bfa',
    available: false,
  },
  {
    id: 'carriere',
    label: 'Carrière',
    desc: 'Compétences & progression professionnelle',
    icon: Briefcase,
    color: '#f59e0b',
    available: false,
  },
  {
    id: 'savoir',
    label: 'Savoir',
    desc: 'Lectures, cours & apprentissage',
    icon: BookOpen,
    color: '#f472b6',
    available: false,
  },
  {
    id: 'sante',
    label: 'Santé',
    desc: 'Bien-être, habitudes & sommeil',
    icon: HeartPulse,
    color: '#fb7185',
    available: false,
  },
]

const NOTCH = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'

const container = {
  animate: { transition: { staggerChildren: 0.07 } },
}

const item = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

function ModuleCard({ module: m }: { module: SystemModule }) {
  const Icon = m.icon

  const inner = (
    <div
      className="glass-card group relative h-full overflow-hidden p-5 transition-all"
      style={{
        opacity: m.available ? 1 : 0.55,
        cursor: m.available ? 'pointer' : 'default',
      }}
    >
      {/* scanning sweep on hover for available modules */}
      {m.available && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cyan-400/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center border"
          style={{
            clipPath: NOTCH,
            color: m.available ? m.color : '#64748b',
            borderColor: m.available ? `${m.color}66` : 'rgba(148,163,184,0.25)',
            background: m.available ? `${m.color}14` : 'rgba(148,163,184,0.06)',
            boxShadow: m.available ? `0 0 18px ${m.color}40` : 'none',
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        {m.available ? (
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-200/70 border border-cyan-400/30 px-2 py-0.5">
            Accès
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-[0.2em] text-slate-400/60 border border-slate-400/20 px-2 py-0.5">
            <Lock className="h-2.5 w-2.5" />
            Verrouillé
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <h3
          className="text-base font-mono font-bold uppercase tracking-wider"
          style={{ color: m.available ? '#e2f6ff' : '#94a3b8' }}
        >
          {m.label}
        </h3>
        <p className="mt-1 text-[11px] font-mono leading-relaxed text-cyan-100/30">{m.desc}</p>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-cyan-400/10 pt-3">
        {m.available ? (
          <>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300/80">Entrer</span>
            <ChevronRight className="h-4 w-4 text-cyan-300/80 transition-transform group-hover:translate-x-1" />
          </>
        ) : (
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400/50">Arrive bientôt</span>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      variants={item}
      className="h-full"
      whileHover={m.available ? { scale: 1.025 } : undefined}
      whileTap={m.available ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {m.available && m.href ? (
        <Link href={m.href} className="block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </motion.div>
  )
}

export default function SystemHubPage() {
  return (
    <main className="system-ui relative min-h-screen w-full bg-[#030712] px-4 py-10 md:px-8 md:py-16">
      <div className="relative mx-auto w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 border border-cyan-400/25 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-300/70">Système en ligne</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-mono font-black tracking-[0.15em] neon-text-cyan"
          >
            ⟦ SYSTEM ⟧
          </h1>
          <p className="mt-3 text-xs md:text-sm font-mono text-cyan-100/40">
            Bienvenue, <span className="neon-text-cyan">Joueur</span>. Sélectionnez un module à explorer.
          </p>
        </motion.div>

        {/* Module grid */}
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {MODULES.map(m => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </motion.div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-100/20"
        >
          {MODULES.filter(m => m.available).length} / {MODULES.length} modules déverrouillés
        </motion.p>
      </div>
    </main>
  )
}

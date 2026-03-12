'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  badge?: string
  accentColor?: string
  children: ReactNode
  className?: string
}

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  badge,
  accentColor = 'from-cyan-500 to-blue-600',
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        'group/section relative overflow-hidden rounded-2xl',
        'bg-[#080d1a]/80 backdrop-blur-xl',
        'border border-white/[0.06]',
        'shadow-[0_0_30px_-10px_rgba(0,200,255,0.08)]',
        'hover:border-white/[0.1] transition-all duration-500',
        className,
      )}
    >
      {/* Subtle top-edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left group/btn"
      >
        {icon && (
          <div className={cn(
            'p-2 rounded-xl bg-gradient-to-br shadow-lg',
            accentColor,
            'shadow-cyan-500/20',
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">{title}</h3>
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/20">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/30 transition-transform duration-300 group-hover/btn:text-white/50',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-500 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

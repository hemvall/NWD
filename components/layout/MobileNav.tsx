'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, TrendingDown, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: TrendingUp },
  { href: '/liabilities', label: 'Debts', icon: TrendingDown },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#060e20] border-t border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0',
                active
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-500'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#04091a]/90 backdrop-blur border-b border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}

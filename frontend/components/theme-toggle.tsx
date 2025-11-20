'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-9 w-9 rounded-lg hover:bg-sidebar-accent transition-colors"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      suppressHydrationWarning
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
    </Button>
  )
}

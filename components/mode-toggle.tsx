'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Avoid hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = theme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      title={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

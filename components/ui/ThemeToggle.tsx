'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './button'

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

function setDarkMode(next: boolean) {
  document.documentElement.classList.toggle('dark', next)
  try {
    localStorage.setItem('theme', next ? 'dark' : 'light')
  } catch {}
  listeners.forEach((listener) => listener())
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <Button variant="ghost" onClick={() => setDarkMode(!isDark)} aria-label="Toggle theme" className="px-2.5">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

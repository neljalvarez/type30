'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'type30-theme'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const getSnapshot = () => document.documentElement.classList.contains('dark')
const getServerSnapshot = () => false

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Storage can be blocked (private mode); the theme still switches for this visit.
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Sun className="size-4" aria-hidden="true" />
      <span
        className="relative h-5 w-9 rounded-full bg-secondary transition-colors data-[on=true]:bg-primary"
        data-on={dark}
        aria-hidden="true"
      >
        <span
          className="absolute left-0.5 top-0.5 size-4 rounded-full bg-foreground transition-transform data-[on=true]:translate-x-4 data-[on=true]:bg-primary-foreground"
          data-on={dark}
        />
      </span>
      <Moon className="size-4" aria-hidden="true" />
    </button>
  )
}

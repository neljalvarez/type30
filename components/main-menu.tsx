'use client'

import { GraduationCap, Keyboard, Skull, User } from 'lucide-react'
import type { Mode } from '@/components/mode-selector'
import { sfxSelect } from '@/lib/chiptune'

export function MainMenu({ onStart, onLearn }: { onStart: (mode: Mode) => void; onLearn: () => void }) {
  return (
    <section aria-label="Main menu" className="flex w-full flex-col items-center gap-12 py-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <Keyboard className="size-12 text-primary" aria-hidden="true" />
        <h2 className="font-mono text-6xl font-semibold tracking-tight sm:text-8xl">
          TYPE <span className="text-primary">30</span>
        </h2>
        <p className="max-w-md text-muted-foreground">
          30 seconds. As many words as you can. Go it alone, or race a boss.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            sfxSelect()
            onStart('solo')
          }}
          autoFocus
          className="flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-5 font-mono text-xl font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <User className="size-6" aria-hidden="true" />
          SOLO MODE
        </button>
        <button
          type="button"
          onClick={() => {
            sfxSelect()
            onStart('boss')
          }}
          className="flex items-center justify-center gap-3 rounded-xl border-2 border-foreground/80 bg-card px-6 py-5 font-mono text-xl font-semibold tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Skull className="size-6" aria-hidden="true" />
          BOSS MODE
        </button>
        <button
          type="button"
          onClick={() => {
            sfxSelect()
            onLearn()
          }}
          className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border px-6 py-4 font-mono text-base font-semibold tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <GraduationCap className="size-5" aria-hidden="true" />
          WAIT, HOW DO I TYPE PROPERLY?
        </button>
      </div>
    </section>
  )
}

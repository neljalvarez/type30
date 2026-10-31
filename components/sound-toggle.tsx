'use client'

import { useSyncExternalStore } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isMuted, setMuted, subscribeMuted, sfxSelect } from '@/lib/chiptune'

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false)

  return (
    <button
      type="button"
      aria-pressed={!muted}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      onClick={() => {
        setMuted(!muted)
        if (muted) sfxSelect()
      }}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
    >
      {muted ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
    </button>
  )
}

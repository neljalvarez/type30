import type { KeyStats } from '@/lib/typing-stats'
import { cn } from '@/lib/utils'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

function keyStyle(stats: KeyStats, key: string) {
  const entry = stats[key]
  const attempts = entry ? entry.hits + entry.misses : 0
  const missRate = attempts ? entry.misses / attempts : 0
  const intensity = Math.min(missRate / 0.25, 1)
  return { attempts, missRate, intensity }
}

export function KeyHeatmap({ keyStats }: { keyStats: KeyStats }) {
  const problemKeys = Object.entries(keyStats)
    .filter(([, s]) => s.misses > 0)
    .map(([key, s]) => ({ key, misses: s.misses, accuracy: Math.round((s.hits / (s.hits + s.misses)) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy || b.misses - a.misses)
    .slice(0, 5)

  return (
    <section aria-labelledby="keys-heading" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 id="keys-heading" className="text-sm uppercase tracking-widest text-muted-foreground">
          Key accuracy
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
          Clean
          <span className="h-2 w-16 rounded-full bg-gradient-to-r from-card to-destructive ring-1 ring-border" />
          Missed
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 font-mono" role="img" aria-label="Keyboard heatmap of mistakes per key">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-1.5">
            {row.split('').map((key) => (
              <KeyCap key={key} label={key} keyStats={keyStats} char={key} className="size-8 sm:size-9" />
            ))}
          </div>
        ))}
        <KeyCap label="space" keyStats={keyStats} char=" " className="h-8 w-56 text-xs sm:h-9 sm:w-64" />
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Problem keys</h4>
        {problemKeys.length === 0 ? (
          <p className="text-sm text-foreground">No missed keys. Flawless.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {problemKeys.map((k) => (
              <li key={k.key} className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 font-mono text-sm">
                <span className="font-semibold text-destructive">{k.key === ' ' ? 'space' : k.key}</span>
                <span className="text-muted-foreground">
                  {k.accuracy}% · {k.misses} {k.misses === 1 ? 'miss' : 'misses'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function KeyCap({
  label,
  char,
  keyStats,
  className,
}: {
  label: string
  char: string
  keyStats: KeyStats
  className?: string
}) {
  const { attempts, missRate, intensity } = keyStyle(keyStats, char)
  return (
    <span
      title={attempts ? `${label}: ${Math.round((1 - missRate) * 100)}% accurate over ${attempts} presses` : `${label}: not typed`}
      className={cn(
        'flex items-center justify-center rounded-md border text-sm uppercase',
        attempts ? 'border-foreground/15 text-foreground' : 'border-border text-muted-foreground/50',
        className,
      )}
      style={
        attempts
          ? {
              backgroundColor: `color-mix(in oklab, var(--destructive) ${Math.round(intensity * 100)}%, var(--card))`,
              color: intensity > 0.5 ? 'var(--primary-foreground)' : undefined,
            }
          : undefined
      }
    >
      {label}
    </span>
  )
}

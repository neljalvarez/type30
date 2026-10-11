import { RotateCcw } from 'lucide-react'

export type TypingStats = {
  wpm: number
  rawWpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  wordsTyped: number
  history: number[]
}

function rating(wpm: number) {
  if (wpm >= 100) return 'Lightning fingers'
  if (wpm >= 70) return 'Seriously fast'
  if (wpm >= 50) return 'Above average'
  if (wpm >= 35) return 'Solid typist'
  return 'Keep practicing'
}

export function TypingResults({
  stats,
  onRestart,
}: {
  stats: TypingStats
  onRestart: () => void
}) {
  const maxWpm = Math.max(...stats.history, 1)

  return (
    <section aria-labelledby="results-heading" className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="results-heading" className="text-sm uppercase tracking-widest text-muted-foreground">
            Words per minute
          </h2>
          <p className="font-mono text-8xl font-semibold leading-none text-primary tabular-nums md:text-9xl">
            {stats.wpm}
          </p>
          <p className="text-lg text-foreground">{rating(stats.wpm)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat label="Accuracy" value={`${stats.accuracy}%`} />
          <Stat label="Raw WPM" value={stats.rawWpm} />
          <Stat label="Words" value={stats.wordsTyped} />
          <Stat
            label="Characters"
            value={
              <>
                <span className="text-foreground">{stats.correctChars}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive">{stats.incorrectChars}</span>
              </>
            }
          />
        </dl>
      </div>

      {stats.history.length > 0 && (
        <figure className="flex flex-col gap-3">
          <figcaption className="text-sm uppercase tracking-widest text-muted-foreground">
            Speed over 30 seconds
          </figcaption>
          <div className="flex h-28 items-end gap-1" role="img" aria-label={`Speed peaked at ${maxWpm} words per minute`}>
            {stats.history.map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/70 transition-all"
                style={{ height: `${Math.max((value / maxWpm) * 100, 2)}%` }}
                title={`${i + 1}s: ${value} wpm`}
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>1s</span>
            <span>30s</span>
          </div>
        </figure>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          autoFocus
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
        <p className="text-sm text-muted-foreground">
          or press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">Enter</kbd>
        </p>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-mono text-3xl font-medium tabular-nums">{value}</dd>
    </div>
  )
}

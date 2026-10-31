'use client'

import { useEffect, useRef } from 'react'
import { RotateCcw, Skull, Trophy } from 'lucide-react'
import { KeyHeatmap } from '@/components/analytics/key-heatmap'
import { SpeedChart } from '@/components/analytics/speed-chart'
import { WordBreakdown } from '@/components/analytics/word-breakdown'
import type { BossResult, TypingStats } from '@/lib/typing-stats'

export type { TypingStats }

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
  onMenu,
  locked,
}: {
  stats: TypingStats
  onRestart: () => void
  onMenu: () => void
  locked: boolean
}) {
  const restartRef = useRef<HTMLButtonElement>(null)

  // Only take focus once the 2s lock ends, so leftover keystrokes can't press the button.
  useEffect(() => {
    if (!locked) restartRef.current?.focus()
  }, [locked])

  const avgWordSeconds =
    stats.wordTimings.length > 0
      ? (stats.wordTimings.reduce((sum, t) => sum + t.ms, 0) / stats.wordTimings.length / 1000).toFixed(2)
      : '0.00'

  return (
    <section aria-labelledby="results-heading" className="flex w-full flex-col gap-8">
      {stats.boss && <BossVerdict boss={stats.boss} playerWpm={stats.wpm} />}

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="results-heading" className="text-sm uppercase tracking-widest text-muted-foreground">
            Words per minute
          </h2>
          <p className="font-mono text-8xl font-semibold leading-none tabular-nums md:text-9xl" style={{ color: '#F65135' }}>
            {stats.wpm}
          </p>
          <p className="text-lg text-foreground">{rating(stats.wpm)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat label="Accuracy" value={`${stats.accuracy}%`} />
          <Stat label="Raw WPM" value={stats.rawWpm} />
          <Stat label="Consistency" value={`${stats.consistency}%`} />
          <Stat label="Peak WPM" value={stats.peakWpm} />
        </dl>
      </div>

      {stats.samples.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SpeedChart samples={stats.samples} bossWpm={stats.boss?.wpm} />
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-4">
        <Stat
          label="Characters"
          size="sm"
          value={
            <>
              <span className="text-foreground">{stats.correctChars}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-destructive">{stats.incorrectChars}</span>
            </>
          }
        />
        <Stat
          label="Words"
          size="sm"
          value={
            <>
              <span className="text-foreground">{stats.wordsTyped}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-destructive">{stats.wordsMissed}</span>
            </>
          }
        />
        <Stat label="Backspaces" size="sm" value={stats.backspaces} />
        <Stat label="Avg per word" size="sm" value={`${avgWordSeconds}s`} />
      </dl>

      <div className="grid gap-6 md:grid-cols-2">
        <KeyHeatmap keyStats={stats.keyStats} />
        <WordBreakdown wordTimings={stats.wordTimings} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          ref={restartRef}
          type="button"
          onClick={onRestart}
          disabled={locked}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:hover:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {stats.boss ? 'Rematch' : 'Try again'}
        </button>
        <button
          type="button"
          onClick={onMenu}
          disabled={locked}
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-40 disabled:hover:no-underline"
        >
          Main menu
        </button>
        <p className="text-sm text-muted-foreground">
          or press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">Enter</kbd>
        </p>
      </div>
    </section>
  )
}

function BossVerdict({ boss, playerWpm }: { boss: BossResult; playerWpm: number }) {
  const bossWpm = boss.wpm
  const won = boss.won
  const margin = Math.abs(Math.round(boss.playerChars - boss.chars))
  const seconds = boss.seconds.toFixed(1)

  return (
    <div
      className={
        won
          ? 'flex items-center gap-4 rounded-xl bg-primary p-5 text-primary-foreground'
          : 'flex items-center gap-4 rounded-xl border-2 border-foreground/80 bg-card p-5 text-foreground'
      }
      role="status"
    >
      <span
        className={
          won
            ? 'flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15'
            : 'flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background'
        }
      >
        {won ? <Trophy className="size-6" aria-hidden="true" /> : <Skull className="size-6" aria-hidden="true" />}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-xl font-semibold">{won ? `You defeated ${boss.name}` : `${boss.name} wins this round`}</p>
        <p className={won ? 'text-sm text-primary-foreground/80' : 'text-sm text-muted-foreground'}>
          {won
            ? `Finished in ${seconds}s, ${margin} characters ahead.`
            : `Knocked out after ${seconds}s, ${margin} characters behind. Run it back.`}
        </p>
        <p className={won ? 'text-xs text-primary-foreground/70' : 'text-xs text-muted-foreground'}>♪ {boss.song}</p>
      </div>
      <div className="hidden items-center gap-3 font-mono tabular-nums sm:flex">
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-widest opacity-70">You</span>
          <span className="text-2xl font-semibold">{playerWpm}</span>
        </div>
        <span className="opacity-50">vs</span>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest opacity-70">Boss</span>
          <span className="text-2xl font-semibold">{bossWpm}</span>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, size = 'lg' }: { label: string; value: React.ReactNode; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={size === 'lg' ? 'font-mono text-3xl font-medium tabular-nums' : 'font-mono text-xl font-medium tabular-nums'}>{value}</dd>
    </div>
  )
}

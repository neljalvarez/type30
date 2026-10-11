'use client'

import { useState } from 'react'
import type { SecondSample } from '@/lib/typing-stats'

export function SpeedChart({ samples, bossWpm }: { samples: SecondSample[]; bossWpm?: number }) {
  const [active, setActive] = useState<number | null>(null)
  const n = samples.length
  const top = Math.max(...samples.map((s) => Math.max(s.wpm, s.raw)), bossWpm ?? 0, 20)
  const max = Math.ceil(top / 20) * 20
  const maxErrors = Math.max(...samples.map((s) => s.errors), 1)

  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)
  const y = (value: number) => 100 - (value / max) * 100
  const points = (key: 'wpm' | 'raw') => samples.map((s, i) => `${x(i)},${y(s[key])}`).join(' ')

  const sample = active !== null ? samples[active] : null
  const peak = Math.max(...samples.map((s) => s.wpm))

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    setActive(Math.min(Math.max(Math.round(ratio * (n - 1)), 0), n - 1))
  }

  return (
    <figure className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-sm uppercase tracking-widest text-muted-foreground">Speed over time</figcaption>
        <ul className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <LegendItem swatch="h-0.5 w-4 bg-primary" label="WPM" />
          <LegendItem swatch="h-0.5 w-4 bg-muted-foreground" label="Raw" />
          <LegendItem swatch="size-2 rounded-sm bg-destructive/60" label="Errors" />
          {bossWpm !== undefined && <LegendItem swatch="h-0 w-4 border-t-2 border-dashed border-foreground/60" label="Boss" />}
        </ul>
      </div>

      <p className="h-5 font-mono text-sm text-foreground" aria-live="polite">
        {sample ? (
          <>
            <span className="text-muted-foreground">{sample.second}s</span>
            {' · '}
            <span className="text-primary">{sample.wpm} wpm</span>
            {' · '}
            {sample.raw} raw
            {' · '}
            <span className={sample.errors > 0 ? 'text-destructive' : undefined}>
              {sample.errors} {sample.errors === 1 ? 'error' : 'errors'}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">Hover the chart to inspect each second</span>
        )}
      </p>

      <div className="flex gap-3">
        <div className="flex h-52 w-8 shrink-0 flex-col justify-between text-right font-mono text-xs text-muted-foreground" aria-hidden="true">
          {[max, (max * 3) / 4, max / 2, max / 4, 0].map((v) => (
            <span key={v} className="-my-2 leading-4">
              {Math.round(v)}
            </span>
          ))}
        </div>

        <div className="relative h-52 flex-1">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            role="img"
            aria-label={`Speed chart across ${n} seconds. Peak ${peak} words per minute.`}
          >
            {[0, 25, 50, 75, 100].map((gy) => (
              <line key={gy} x1={0} x2={100} y1={gy} y2={gy} stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {samples.map((s, i) =>
              s.errors > 0 ? (
                <rect
                  key={i}
                  x={x(i) - 0.7}
                  width={1.4}
                  y={100 - (s.errors / maxErrors) * 28}
                  height={(s.errors / maxErrors) * 28}
                  fill="var(--destructive)"
                  opacity={0.55}
                />
              ) : null,
            )}
            {bossWpm !== undefined && (
              <line
                x1={0}
                x2={100}
                y1={y(bossWpm)}
                y2={y(bossWpm)}
                stroke="var(--foreground)"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {n > 1 && <polygon points={`${x(0)},100 ${points('wpm')} ${x(n - 1)},100`} fill="var(--primary)" opacity={0.12} />}
            <polyline
              points={points('raw')}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={points('wpm')}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {active !== null && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={0}
                y2={100}
                stroke="var(--foreground)"
                strokeOpacity={0.25}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {sample && active !== null && (
            <span
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
              style={{ left: `${x(active)}%`, top: `${y(sample.wpm)}%` }}
              aria-hidden="true"
            />
          )}

          <div className="absolute inset-0 cursor-crosshair" onMouseMove={handleMove} onMouseLeave={() => setActive(null)} aria-hidden="true" />
        </div>
      </div>

      <div className="flex justify-between pl-11 font-mono text-xs text-muted-foreground" aria-hidden="true">
        <span>1s</span>
        <span>{Math.ceil(n / 2)}s</span>
        <span>{n}s</span>
      </div>
    </figure>
  )
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={swatch} aria-hidden="true" />
      {label}
    </li>
  )
}

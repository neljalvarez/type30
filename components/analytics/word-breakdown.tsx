import { wordWpm, type WordTiming } from '@/lib/typing-stats'

export function WordBreakdown({ wordTimings }: { wordTimings: WordTiming[] }) {
  const correct = wordTimings.filter((t) => t.typed === t.word)
  const slowest = correct
    .map((t) => ({ word: t.word, wpm: wordWpm(t) }))
    .sort((a, b) => a.wpm - b.wpm)
    .slice(0, 5)
  const fastest = Math.max(...correct.map(wordWpm), 1)
  const missed = wordTimings.filter((t) => t.typed !== t.word).slice(0, 6)

  return (
    <section aria-labelledby="words-heading" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
      <h3 id="words-heading" className="text-sm uppercase tracking-widest text-muted-foreground">
        Word breakdown
      </h3>

      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Slowest words</h4>
        {slowest.length === 0 ? (
          <p className="text-sm text-foreground">Finish a word correctly to see timings.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slowest.map((w, i) => (
              <li key={`${w.word}-${i}`} className="flex items-center gap-3 font-mono text-sm">
                <span className="w-24 shrink-0 truncate text-foreground">{w.word}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max((w.wpm / fastest) * 100, 4)}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground">{w.wpm} wpm</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Missed words</h4>
        {missed.length === 0 ? (
          <p className="text-sm text-foreground">Every word was spot on.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {missed.map((m, i) => (
              <li key={`${m.word}-${i}`} className="flex items-baseline gap-2 rounded-md bg-secondary px-2.5 py-1 font-mono text-sm">
                <span className="text-foreground">{m.word}</span>
                <span className="text-destructive line-through decoration-destructive/60">{m.typed}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

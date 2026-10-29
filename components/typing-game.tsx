'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { generateWords } from '@/lib/words'
import { BOSS_TIERS, bossCharsAt, bossPosition, type BossConfig } from '@/lib/boss'
import {
  computeConsistency,
  countCorrectChars,
  toWpm,
  type KeyStats,
  type SecondSample,
  type WordTiming,
} from '@/lib/typing-stats'
import { TypingResults, type TypingStats } from '@/components/typing-results'
import { WordDisplay } from '@/components/word-display'
import { ModeSelector, type Mode } from '@/components/mode-selector'
import { BossRace } from '@/components/boss-race'
import { MainMenu } from '@/components/main-menu'
import { ArrowLeft } from 'lucide-react'

const DURATION = 30
const RESULTS_LOCK_MS = 2000

type Status = 'idle' | 'running' | 'finished'

export function TypingGame() {
  const [seed, setSeed] = useState(2026)
  const [words, setWords] = useState(() => generateWords(2026))
  const [typed, setTyped] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [elapsed, setElapsed] = useState(0)
  const [focused, setFocused] = useState(false)
  const [stats, setStats] = useState<TypingStats | null>(null)
  const [mode, setMode] = useState<Mode>('solo')
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  const [resultsLocked, setResultsLocked] = useState(false)
  const [boss, setBoss] = useState<BossConfig>({
    tierId: BOSS_TIERS[1].id,
    name: BOSS_TIERS[1].name,
    wpm: BOSS_TIERS[1].wpm,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef(0)
  const typedRef = useRef<string[]>([])
  const currentRef = useRef('')
  const keystrokesRef = useRef({ correct: 0, total: 0 })
  const errorsRef = useRef(0)
  const backspacesRef = useRef(0)
  const samplesRef = useRef<SecondSample[]>([])
  const lastSampleRef = useRef({ total: 0, errors: 0 })
  const keyStatsRef = useRef<KeyStats>({})
  const wordTimingsRef = useRef<WordTiming[]>([])
  const lastWordAtRef = useRef(0)

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const restart = useCallback(() => {
    const nextSeed = Math.floor(Math.random() * 2 ** 31)
    setSeed(nextSeed)
    setWords(generateWords(nextSeed))
    setTyped([])
    setCurrent('')
    setStatus('idle')
    setTimeLeft(DURATION)
    setElapsed(0)
    setStats(null)
    typedRef.current = []
    currentRef.current = ''
    keystrokesRef.current = { correct: 0, total: 0 }
    errorsRef.current = 0
    backspacesRef.current = 0
    samplesRef.current = []
    lastSampleRef.current = { total: 0, errors: 0 }
    keyStatsRef.current = {}
    wordTimingsRef.current = []
    focusInput()
  }, [focusInput])

  const finish = useCallback(() => {
    const correctChars = countCorrectChars(words, typedRef.current, currentRef.current)
    const { correct, total } = keystrokesRef.current
    const samples = samplesRef.current
    const typedWords = typedRef.current
    const wordsTyped = typedWords.filter((w, i) => w === words[i]).length

    setStats({
      wpm: toWpm(correctChars, DURATION),
      rawWpm: toWpm(total, DURATION),
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
      correctChars: correct,
      incorrectChars: total - correct,
      wordsTyped,
      wordsMissed: typedWords.length - wordsTyped,
      backspaces: backspacesRef.current,
      consistency: computeConsistency(samples.map((s) => s.raw)),
      peakWpm: Math.max(0, ...samples.slice(2).map((s) => s.wpm)),
      samples,
      keyStats: keyStatsRef.current,
      wordTimings: wordTimingsRef.current,
      boss:
        mode === 'boss'
          ? {
              name: boss.name,
              wpm: boss.wpm,
              chars: Math.round(bossCharsAt(boss.wpm, DURATION)),
              playerChars: correctChars,
            }
          : null,
    })
    setResultsLocked(true)
    setStatus('finished')
    inputRef.current?.blur()
  }, [words, mode, boss])

  // Keep the results on screen for 2s so keys still being pressed can't restart the test.
  useEffect(() => {
    if (status !== 'finished') return
    setResultsLocked(true)
    const timeout = setTimeout(() => setResultsLocked(false), RESULTS_LOCK_MS)
    return () => clearTimeout(timeout)
  }, [status])

  const goToMenu = useCallback(() => {
    restart()
    setScreen('menu')
  }, [restart])

  useEffect(() => {
    if (status !== 'running') return
    const interval = setInterval(() => {
      const now = (performance.now() - startTimeRef.current) / 1000
      const elapsedWhole = Math.min(Math.floor(now), DURATION)

      while (samplesRef.current.length < elapsedWhole) {
        const second = samplesRef.current.length + 1
        const chars = countCorrectChars(words, typedRef.current, currentRef.current)
        const total = keystrokesRef.current.total
        const errors = errorsRef.current
        samplesRef.current.push({
          second,
          wpm: toWpm(chars, second),
          raw: (total - lastSampleRef.current.total) * 12,
          errors: errors - lastSampleRef.current.errors,
        })
        lastSampleRef.current = { total, errors }
      }

      const remaining = Math.max(DURATION - now, 0)
      setElapsed(Math.min(now, DURATION))
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) {
        clearInterval(interval)
        finish()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [status, words, finish])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (screen === 'menu') return
      if (event.key === 'Escape') {
        event.preventDefault()
        if (status === 'finished' && resultsLocked) return
        restart()
        return
      }
      if (status === 'finished') return
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' && target !== inputRef.current) return
      if (document.activeElement !== inputRef.current && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status, restart, screen, resultsLocked])

  function handleStart(next: Mode) {
    setMode(next)
    setScreen('game')
  }

  function recordKey(char: string, hit: boolean) {
    const entry = (keyStatsRef.current[char] ??= { hits: 0, misses: 0 })
    if (hit) entry.hits += 1
    else entry.misses += 1
  }

  function registerKeystroke(hit: boolean) {
    keystrokesRef.current.total += 1
    if (hit) keystrokesRef.current.correct += 1
    else errorsRef.current += 1
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (status === 'finished') return
    setFocused(true)
    const value = event.target.value
    const previous = currentRef.current
    const target = words[typedRef.current.length] ?? ''
    const now = performance.now()

    if (status === 'idle' && value.length > 0) {
      startTimeRef.current = now
      lastWordAtRef.current = now
      setStatus('running')
    }

    if (value.endsWith(' ')) {
      const word = value.trim()
      if (!word) {
        setCurrent('')
        currentRef.current = ''
        return
      }
      const hit = word === target
      registerKeystroke(hit)
      recordKey(' ', hit)
      wordTimingsRef.current.push({ word: target, typed: word, ms: now - lastWordAtRef.current })
      lastWordAtRef.current = now

      const nextTyped = [...typedRef.current, word]
      typedRef.current = nextTyped
      currentRef.current = ''
      setTyped(nextTyped)
      setCurrent('')
      if (nextTyped.length >= words.length) finish()
      return
    }

    if (value.length > previous.length) {
      for (let i = previous.length; i < value.length; i++) {
        const expected = target[i]
        const hit = value[i] === expected
        registerKeystroke(hit)
        if (expected) recordKey(expected, hit)
      }
    } else if (value.length < previous.length) {
      backspacesRef.current += previous.length - value.length
    }

    currentRef.current = value
    setCurrent(value)
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    focusInput()
  }

  function handleBossChange(next: BossConfig) {
    setBoss(next)
    if (next.tierId !== 'custom') focusInput()
  }

  const elapsedSeconds = DURATION - timeLeft
  const playerChars = countCorrectChars(words, typed, current)
  const liveWpm = status === 'running' && elapsedSeconds >= 2 ? toWpm(playerChars, elapsedSeconds) : 0
  const bossChars = mode === 'boss' && status === 'running' ? bossCharsAt(boss.wpm, elapsed) : 0
  const bossCaret = mode === 'boss' && status === 'running' ? bossPosition(words, bossChars) : null

  if (screen === 'menu') {
    return <MainMenu onStart={handleStart} />
  }

  if (status === 'finished' && stats) {
    return <TypingResults stats={stats} onRestart={restart} onMenu={goToMenu} locked={resultsLocked} />
  }

  return (
    <section aria-label="Typing test" className="flex w-full flex-col gap-8">
      <button
        type="button"
        onClick={goToMenu}
        className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Main menu
      </button>

      <ModeSelector
        mode={mode}
        onModeChange={handleModeChange}
        boss={boss}
        onBossChange={handleBossChange}
        disabled={status === 'running'}
      />

      <div className="flex items-end justify-between font-mono">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Time</span>
          <span className="text-5xl font-semibold tabular-nums text-primary" aria-live="off">
            {timeLeft}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">WPM</span>
          <span className="text-5xl font-semibold tabular-nums text-foreground">{liveWpm}</span>
        </div>
      </div>

      {mode === 'boss' ? (
        <BossRace
          playerChars={playerChars}
          bossChars={bossChars}
          bossName={boss.name}
          bossWpm={boss.wpm}
          finishChars={bossCharsAt(boss.wpm, DURATION)}
        />
      ) : (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
            style={{ width: `${(timeLeft / DURATION) * 100}%` }}
          />
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={current}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => e.preventDefault()}
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the words shown"
          className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0"
        />
        <WordDisplay
          key={seed}
          words={words}
          typed={typed}
          current={current}
          blurred={!focused}
          bossWord={bossCaret?.word}
          bossChar={bossCaret?.char}
        />
        {!focused && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg text-foreground"
            aria-hidden="true"
          >
            Click here or start typing to focus
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={restart}
          aria-label="Restart test"
          className="rounded-lg p-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
        </button>
        <p className="text-sm text-muted-foreground">
          {status === 'idle' ? 'The timer starts on your first keystroke. ' : ''}
          Press{' '}
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">Esc</kbd>{' '}
          to restart
        </p>
      </div>
    </section>
  )
}

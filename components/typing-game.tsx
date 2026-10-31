'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw, Swords } from 'lucide-react'
import { generateWords } from '@/lib/words'
import {
  BOSS_TIERS,
  BOSS_WORDS,
  bossCharsAt,
  bossHealth,
  bossPosition,
  bossTheme,
  passageChars,
  type BossConfig,
} from '@/lib/boss'
import {
  songForBoss,
  startMusic,
  stopMusic,
  sfxCountdown,
  sfxError,
  sfxKey,
  sfxLose,
  sfxSelect,
  sfxWin,
  sfxWord,
} from '@/lib/chiptune'
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
import { LearnToType } from '@/components/learn-to-type'

const DURATION = 30
const RESULTS_LOCK_MS = 2000
const COUNTDOWN_STEP_MS = 750

type Status = 'idle' | 'countdown' | 'running' | 'finished'
type Screen = 'menu' | 'game' | 'learn'

const makeWords = (seed: number, mode: Mode) => generateWords(seed, mode === 'boss' ? BOSS_WORDS : 200)

export function TypingGame() {
  const [seed, setSeed] = useState(2026)
  const [words, setWords] = useState(() => generateWords(2026))
  const [typed, setTyped] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [elapsed, setElapsed] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [focused, setFocused] = useState(false)
  const [stats, setStats] = useState<TypingStats | null>(null)
  const [mode, setMode] = useState<Mode>('solo')
  const [screen, setScreen] = useState<Screen>('menu')
  const [resultsLocked, setResultsLocked] = useState(false)
  const [boss, setBoss] = useState<BossConfig>({
    tierId: BOSS_TIERS[1].id,
    name: BOSS_TIERS[1].name,
    wpm: BOSS_TIERS[1].wpm,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef(0)
  const finishedRef = useRef(false)
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

  const isBoss = mode === 'boss'

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const reset = useCallback(
    (nextMode: Mode) => {
      stopMusic()
      const nextSeed = Math.floor(Math.random() * 2 ** 31)
      setSeed(nextSeed)
      setWords(makeWords(nextSeed, nextMode))
      setTyped([])
      setCurrent('')
      setStatus('idle')
      setTimeLeft(DURATION)
      setElapsed(0)
      setCountdown(3)
      setStats(null)
      setResultsLocked(false)
      finishedRef.current = false
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
    },
    [focusInput],
  )

  const restart = useCallback(() => reset(mode), [reset, mode])

  const finish = useCallback(
    (outcome: 'win' | 'lose' = 'win') => {
      if (finishedRef.current) return
      finishedRef.current = true
      stopMusic()

      const seconds = isBoss ? Math.max((performance.now() - startTimeRef.current) / 1000, 1) : DURATION
      const correctChars = countCorrectChars(words, typedRef.current, currentRef.current)
      const { correct, total } = keystrokesRef.current
      const samples = samplesRef.current
      const typedWords = typedRef.current
      const wordsTyped = typedWords.filter((w, i) => w === words[i]).length

      setStats({
        wpm: toWpm(correctChars, seconds),
        rawWpm: toWpm(total, seconds),
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
        boss: isBoss
          ? {
              tierId: boss.tierId,
              name: boss.name,
              wpm: boss.wpm,
              chars: Math.min(Math.round(bossCharsAt(boss.wpm, seconds)), passageChars(words)),
              playerChars: correctChars,
              won: outcome === 'win',
              seconds,
              song: bossTheme(boss.tierId).song,
            }
          : null,
      })
      setResultsLocked(true)
      setStatus('finished')
      inputRef.current?.blur()
      if (isBoss) (outcome === 'win' ? sfxWin : sfxLose)()
    },
    [words, isBoss, boss],
  )

  // Keep the results on screen for 2s so keys still being pressed can't restart the test.
  useEffect(() => {
    if (status !== 'finished') return
    setResultsLocked(true)
    const timeout = setTimeout(() => setResultsLocked(false), RESULTS_LOCK_MS)
    return () => clearTimeout(timeout)
  }, [status])

  useEffect(() => () => stopMusic(), [])

  const goToMenu = useCallback(() => {
    restart()
    setScreen('menu')
  }, [restart])

  // Boss intro: 3, 2, 1, GO, then the race and the theme song begin together.
  useEffect(() => {
    if (status !== 'countdown') return
    let count = 3
    setCountdown(3)
    sfxCountdown(false)
    const interval = setInterval(() => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
        sfxCountdown(false)
        return
      }
      clearInterval(interval)
      setCountdown(0)
      sfxCountdown(true)
      startTimeRef.current = performance.now()
      lastWordAtRef.current = startTimeRef.current
      setStatus('running')
      startMusic(songForBoss(boss.tierId, boss.wpm))
      focusInput()
    }, COUNTDOWN_STEP_MS)
    return () => clearInterval(interval)
  }, [status, boss, focusInput])

  useEffect(() => {
    if (status !== 'running') return
    const total = passageChars(words)
    const interval = setInterval(() => {
      const now = (performance.now() - startTimeRef.current) / 1000
      const cap = isBoss ? Infinity : DURATION
      const elapsedWhole = Math.floor(Math.min(now, cap))

      while (samplesRef.current.length < elapsedWhole) {
        const second = samplesRef.current.length + 1
        const chars = countCorrectChars(words, typedRef.current, currentRef.current)
        const keys = keystrokesRef.current.total
        const errors = errorsRef.current
        samplesRef.current.push({
          second,
          wpm: toWpm(chars, second),
          raw: (keys - lastSampleRef.current.total) * 12,
          errors: errors - lastSampleRef.current.errors,
        })
        lastSampleRef.current = { total: keys, errors }
      }

      setElapsed(Math.min(now, cap))

      if (isBoss) {
        const bossChars = bossCharsAt(boss.wpm, now)
        const playerChars = countCorrectChars(words, typedRef.current, currentRef.current)
        if (bossChars >= total || bossHealth(playerChars, bossChars) <= 0) {
          clearInterval(interval)
          finish('lose')
        }
        return
      }

      const remaining = Math.max(DURATION - now, 0)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) {
        clearInterval(interval)
        finish()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [status, words, finish, isBoss, boss])

  const startFight = useCallback(() => {
    if (!isBoss || status !== 'idle') return
    sfxSelect()
    setStatus('countdown')
  }, [isBoss, status])

  useEffect(() => {
    if (screen !== 'game') return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (status === 'finished' && resultsLocked) return
        restart()
        return
      }
      if (status === 'finished') return
      if (event.key === 'Enter' && isBoss && status === 'idle') {
        event.preventDefault()
        startFight()
        return
      }
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' && target !== inputRef.current) return
      if (document.activeElement !== inputRef.current && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status, restart, screen, resultsLocked, isBoss, startFight])

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
    // In a boss fight you can only type once the countdown hits GO.
    if (isBoss && status !== 'running') return
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

      // Boss fights are strict: a wrong word blocks you until you fix it.
      if (isBoss && !hit) {
        sfxError()
        setCurrent(word)
        currentRef.current = word
        return
      }

      wordTimingsRef.current.push({ word: target, typed: word, ms: now - lastWordAtRef.current })
      lastWordAtRef.current = now

      const nextTyped = [...typedRef.current, word]
      typedRef.current = nextTyped
      currentRef.current = ''
      setTyped(nextTyped)
      setCurrent('')
      if (isBoss) sfxWord()
      if (nextTyped.length >= words.length) finish('win')
      return
    }

    if (value.length > previous.length) {
      for (let i = previous.length; i < value.length; i++) {
        const expected = target[i]
        const hit = value[i] === expected
        registerKeystroke(hit)
        if (expected) recordKey(expected, hit)
        if (isBoss) (hit ? sfxKey : sfxError)()
      }
    } else if (value.length < previous.length) {
      backspacesRef.current += previous.length - value.length
    }

    currentRef.current = value
    setCurrent(value)
  }

  function handleStart(next: Mode) {
    setMode(next)
    reset(next)
    setScreen('game')
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    reset(next)
  }

  function handleBossChange(next: BossConfig) {
    setBoss(next)
    if (next.tierId !== 'custom') focusInput()
  }

  const total = passageChars(words)
  const playerChars = countCorrectChars(words, typed, current)
  const liveWpm = status === 'running' && elapsed >= 2 ? toWpm(playerChars, elapsed) : 0
  const bossChars = isBoss && status === 'running' ? bossCharsAt(boss.wpm, elapsed) : 0
  const bossCaret = isBoss && status === 'running' ? bossPosition(words, bossChars) : null
  const waitingForFight = isBoss && (status === 'idle' || status === 'countdown')
  const showGo = isBoss && status === 'running' && elapsed < 0.8

  if (screen === 'menu') {
    return <MainMenu onStart={handleStart} onLearn={() => setScreen('learn')} />
  }

  if (screen === 'learn') {
    return <LearnToType onExit={() => setScreen('menu')} />
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
        disabled={status === 'running' || status === 'countdown'}
      />

      <div className="flex items-end justify-between font-mono">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Time</span>
          <span className="text-5xl font-semibold tabular-nums text-primary" aria-live="off">
            {isBoss ? `${elapsed.toFixed(1)}s` : timeLeft}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">WPM</span>
          <span className="text-5xl font-semibold tabular-nums text-foreground">{liveWpm}</span>
        </div>
      </div>

      {isBoss ? (
        <BossRace
          tierId={boss.tierId}
          bossName={boss.name}
          bossWpm={boss.wpm}
          playerChars={playerChars}
          bossChars={bossChars}
          totalChars={total}
          active={status === 'running'}
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
          blurred={waitingForFight || !focused}
          bossWord={bossCaret?.word}
          bossChar={bossCaret?.char}
        />

        {isBoss && status === 'idle' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button
              type="button"
              onClick={startFight}
              className="inline-flex items-center gap-3 rounded-xl border-2 border-foreground bg-primary px-8 py-4 font-mono text-2xl font-semibold tracking-widest text-primary-foreground shadow-[4px_4px_0_0_var(--foreground)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Swords className="size-6" aria-hidden="true" />
              FIGHT!
            </button>
          </div>
        )}

        {isBoss && status === 'countdown' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-live="assertive">
            <span key={countdown} className="pixel-pop font-mono text-8xl font-bold text-primary" style={{ textShadow: '4px 4px 0 var(--foreground)' }}>
              {countdown}
            </span>
          </div>
        )}

        {showGo && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden="true">
            <span className="pixel-pop font-mono text-8xl font-bold text-primary" style={{ textShadow: '4px 4px 0 var(--foreground)' }}>
              GO!
            </span>
          </div>
        )}

        {!isBoss && !focused && (
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
        <p className="text-center text-sm text-muted-foreground">
          {isBoss && status === 'idle'
            ? 'Reach the end before the boss does. Every word has to be right to move on. Press Enter to fight. '
            : status === 'idle'
              ? 'The timer starts on your first keystroke. '
              : ''}
          Press{' '}
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">Esc</kbd>{' '}
          to restart
        </p>
      </div>
    </section>
  )
}

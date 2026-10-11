'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { generateWords } from '@/lib/words'
import { TypingResults, type TypingStats } from '@/components/typing-results'
import { WordDisplay } from '@/components/word-display'

const DURATION = 30

type Status = 'idle' | 'running' | 'finished'

function countCorrectChars(words: string[], typed: string[], current: string) {
  let count = 0
  typed.forEach((word, i) => {
    if (word === words[i]) count += word.length + 1
  })
  const target = words[typed.length]
  if (target && current && target.startsWith(current)) count += current.length
  return count
}

function toWpm(chars: number, seconds: number) {
  if (seconds <= 0) return 0
  return Math.round(chars / 5 / (seconds / 60))
}

export function TypingGame() {
  const [seed, setSeed] = useState(2026)
  const [words, setWords] = useState(() => generateWords(2026))
  const [typed, setTyped] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [focused, setFocused] = useState(false)
  const [stats, setStats] = useState<TypingStats | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef(0)
  const typedRef = useRef<string[]>([])
  const currentRef = useRef('')
  const keystrokesRef = useRef({ correct: 0, total: 0 })
  const historyRef = useRef<number[]>([])

  const restart = useCallback(() => {
    const nextSeed = Math.floor(Math.random() * 2 ** 31)
    setSeed(nextSeed)
    setWords(generateWords(nextSeed))
    setTyped([])
    setCurrent('')
    setStatus('idle')
    setTimeLeft(DURATION)
    setStats(null)
    typedRef.current = []
    currentRef.current = ''
    keystrokesRef.current = { correct: 0, total: 0 }
    historyRef.current = []
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const finish = useCallback(() => {
    const correctChars = countCorrectChars(words, typedRef.current, currentRef.current)
    const { correct, total } = keystrokesRef.current
    setStats({
      wpm: toWpm(correctChars, DURATION),
      rawWpm: toWpm(total, DURATION),
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
      correctChars: correct,
      incorrectChars: total - correct,
      wordsTyped: typedRef.current.filter((w, i) => w === words[i]).length,
      history: historyRef.current,
    })
    setStatus('finished')
    inputRef.current?.blur()
  }, [words])

  useEffect(() => {
    if (status !== 'running') return
    const interval = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const elapsedWhole = Math.min(Math.floor(elapsed), DURATION)

      while (historyRef.current.length < elapsedWhole) {
        const second = historyRef.current.length + 1
        const chars = countCorrectChars(words, typedRef.current, currentRef.current)
        historyRef.current.push(toWpm(chars, second))
      }

      const remaining = Math.max(DURATION - elapsed, 0)
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
      if (event.key === 'Escape') {
        event.preventDefault()
        restart()
        return
      }
      if (status === 'finished') return
      if (document.activeElement !== inputRef.current && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status, restart])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (status === 'finished') return
    setFocused(true)
    const value = event.target.value
    const previous = currentRef.current
    const target = words[typedRef.current.length] ?? ''

    if (status === 'idle' && value.length > 0) {
      startTimeRef.current = performance.now()
      setStatus('running')
    }

    if (value.endsWith(' ')) {
      const word = value.trim()
      if (!word) {
        setCurrent('')
        currentRef.current = ''
        return
      }
      keystrokesRef.current.total += 1
      if (word === target) keystrokesRef.current.correct += 1
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
        keystrokesRef.current.total += 1
        if (value[i] === target[i]) keystrokesRef.current.correct += 1
      }
    }

    currentRef.current = value
    setCurrent(value)
  }

  const elapsedSeconds = DURATION - timeLeft
  const liveWpm =
    status === 'running' && elapsedSeconds >= 2
      ? toWpm(countCorrectChars(words, typed, current), elapsedSeconds)
      : 0

  if (status === 'finished' && stats) {
    return <TypingResults stats={stats} onRestart={restart} />
  }

  return (
    <section aria-label="Typing test" className="flex w-full flex-col gap-8">
      <div className="flex items-end justify-between font-mono">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Time</span>
          <span
            className="text-5xl font-semibold tabular-nums text-primary"
            aria-live="off"
          >
            {timeLeft}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">WPM</span>
          <span className="text-5xl font-semibold tabular-nums text-foreground">{liveWpm}</span>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
          style={{ width: `${(timeLeft / DURATION) * 100}%` }}
        />
      </div>

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

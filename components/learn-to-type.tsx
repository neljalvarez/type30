'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, GraduationCap, RotateCcw } from 'lucide-react'
import { FingerLegend, KeyboardGuide } from '@/components/keyboard-guide'
import { FINGERS, FINGER_FOR, LESSONS, buildDrill } from '@/lib/lessons'
import { sfxError, sfxKey, sfxSelect, sfxWin } from '@/lib/chiptune'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'type30-learn'
const PASS_ACCURACY = 90

type Phase = 'list' | 'lesson' | 'drill' | 'done'
type DrillResult = { accuracy: number; seconds: number; wpm: number; passed: boolean }

export function LearnToType({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('list')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [index, setIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [wrongKey, setWrongKey] = useState<string | null>(null)
  const [result, setResult] = useState<DrillResult | null>(null)

  const indexRef = useRef(0)
  const mistakesRef = useRef(0)
  const startedAtRef = useRef(0)

  const lesson = LESSONS[lessonIndex]

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(saved)) setCompleted(saved.filter((id): id is string => typeof id === 'string'))
    } catch {
      // No saved progress is fine.
    }
  }, [])

  const markComplete = useCallback((id: string) => {
    setCompleted((previous) => {
      if (previous.includes(id)) return previous
      const next = [...previous, id]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Progress just won't persist.
      }
      return next
    })
  }, [])

  function openLesson(i: number) {
    sfxSelect()
    setLessonIndex(i)
    setPhase('lesson')
  }

  function startDrill() {
    sfxSelect()
    setTarget(buildDrill(lesson))
    indexRef.current = 0
    mistakesRef.current = 0
    startedAtRef.current = 0
    setIndex(0)
    setMistakes(0)
    setWrongKey(null)
    setResult(null)
    setPhase('drill')
  }

  function finishInfoLesson() {
    markComplete(lesson.id)
    if (lessonIndex < LESSONS.length - 1) openLesson(lessonIndex + 1)
    else setPhase('list')
  }

  useEffect(() => {
    if (!wrongKey) return
    const timeout = setTimeout(() => setWrongKey(null), 260)
    return () => clearTimeout(timeout)
  }, [wrongKey, mistakes])

  useEffect(() => {
    if (phase !== 'drill') return

    function complete() {
      const seconds = Math.max((performance.now() - startedAtRef.current) / 1000, 1)
      const length = target.length
      const accuracy = Math.round((length / (length + mistakesRef.current)) * 100)
      const passed = accuracy >= PASS_ACCURACY
      setResult({ accuracy, seconds, wpm: Math.round(length / 5 / (seconds / 60)), passed })
      if (passed) {
        markComplete(lesson.id)
        sfxWin()
      }
      setPhase('done')
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setPhase('lesson')
        return
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
      event.preventDefault()

      if (startedAtRef.current === 0) startedAtRef.current = performance.now()
      const expected = target[indexRef.current]
      const pressed = event.key.toLowerCase()

      if (pressed === expected) {
        sfxKey()
        indexRef.current += 1
        setIndex(indexRef.current)
        if (indexRef.current >= target.length) complete()
      } else {
        sfxError()
        mistakesRef.current += 1
        setMistakes(mistakesRef.current)
        setWrongKey(pressed)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, target, lesson, markComplete])

  const backToMenu = (
    <button
      type="button"
      onClick={onExit}
      className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Main menu
    </button>
  )

  if (phase === 'list') {
    const nextUp = LESSONS.findIndex((l) => !completed.includes(l.id))
    return (
      <section aria-label="Learn to type" className="flex w-full flex-col gap-8">
        {backToMenu}
        <div className="flex flex-col gap-2">
          <h2 className="flex items-center gap-3 font-mono text-4xl font-semibold tracking-tight">
            <GraduationCap className="size-9 text-primary" aria-hidden="true" />
            Learn to type
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Touch typing means using all ten fingers without looking at the keys. Go through these in order. Each lesson takes a couple of minutes.
          </p>
        </div>

        <ol className="grid gap-3">
          {LESSONS.map((item, i) => {
            const done = completed.includes(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openLesson(i)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-xl border-2 bg-card px-4 py-3 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary',
                    i === nextUp ? 'border-primary' : 'border-border',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold',
                      done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                    )}
                  >
                    {done ? <Check className="size-4" aria-label="Completed" /> : i + 1}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="text-sm text-muted-foreground">{item.blurb}</span>
                  </span>
                  {i === nextUp && (
                    <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 font-mono text-xs text-primary-foreground">
                      {completed.length === 0 ? 'Start here' : 'Up next'}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
        <p className="text-sm text-muted-foreground">The drills need a physical keyboard.</p>
      </section>
    )
  }

  if (phase === 'lesson') {
    return (
      <section aria-label={lesson.title} className="flex w-full flex-col gap-8">
        <button
          type="button"
          onClick={() => setPhase('list')}
          className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All lessons
        </button>

        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Lesson {lessonIndex + 1} of {LESSONS.length}
          </p>
          <h2 className="font-mono text-3xl font-semibold tracking-tight">{lesson.title}</h2>
        </div>

        <ol className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          {lesson.tips.map((tip, i) => (
            <li key={tip} className="flex gap-3 text-foreground">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>

        {lesson.kind !== 'info' && (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <KeyboardGuide focus={lesson.focus} />
            <FingerLegend />
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={lesson.kind === 'info' ? finishInfoLesson : startDrill}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {lesson.kind === 'info' ? 'Got it, next lesson' : 'Start drill'}
          </button>
        </div>
      </section>
    )
  }

  if (phase === 'drill') {
    const expected = target[index] ?? ''
    const finger = FINGER_FOR[expected]
    const fingerInfo = finger ? FINGERS[finger] : null

    return (
      <section aria-label={`${lesson.title} drill`} className="flex w-full flex-col gap-8">
        <div className="flex items-center justify-between font-mono text-sm text-muted-foreground">
          <span>{lesson.title}</span>
          <span>
            Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">Esc</kbd> to quit
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${(index / target.length) * 100}%` }} />
        </div>

        <p className="flex flex-wrap gap-y-3 font-mono text-3xl leading-none md:text-4xl" aria-label="Text to type">
          {target.split('').map((char, i) => (
            <span
              key={i}
              className={cn(
                'inline-block min-w-[0.6em] whitespace-pre text-center',
                i < index && 'text-muted-foreground/50',
                i === index && 'rounded bg-primary px-0.5 text-primary-foreground',
                i > index && 'text-foreground',
              )}
            >
              {char === ' ' ? (i === index ? '␣' : ' ') : char}
            </span>
          ))}
        </p>

        <p className="flex min-h-7 items-center justify-center gap-2 text-center text-lg text-foreground" aria-live="polite">
          {fingerInfo && (
            <span
              className="size-3.5 rounded-sm border-2"
              style={{
                backgroundColor: expected === ' ' ? 'var(--primary)' : `hsl(${fingerInfo.hue} 80% 50%)`,
                borderColor: expected === ' ' ? 'var(--primary)' : `hsl(${fingerInfo.hue} 80% 40%)`,
              }}
              aria-hidden="true"
            />
          )}
          {expected === ' ' ? (
            <>Press <strong>SPACE</strong> with either thumb</>
          ) : (
            <>
              Press <strong className="font-mono uppercase">{expected}</strong> with your <strong>{fingerInfo?.label}</strong>
            </>
          )}
        </p>

        <div className="rounded-xl border border-border bg-card p-5">
          <KeyboardGuide next={expected} focus={lesson.focus} wrong={wrongKey} />
        </div>

        <p className="text-center font-mono text-sm text-muted-foreground">
          Mistakes: <span className={mistakes > 0 ? 'text-destructive' : undefined}>{mistakes}</span>
        </p>
      </section>
    )
  }

  const hasNext = lessonIndex < LESSONS.length - 1
  return (
    <section aria-label="Drill results" className="flex w-full flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">{lesson.title}</p>
        <h2 className="text-3xl font-semibold">{result?.passed ? 'Nice work' : 'Almost there'}</h2>
        <p className="max-w-md text-muted-foreground">
          {result?.passed
            ? hasNext
              ? 'That is 90% accuracy or better. Time for the next lesson.'
              : 'You finished every lesson. Head to SOLO MODE and see how fast you can go.'
            : `You need ${PASS_ACCURACY}% accuracy to pass. Slow down, look at the screen, and go again.`}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-x-10 gap-y-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">Accuracy</dt>
          <dd className={cn('font-mono text-3xl font-medium tabular-nums', result?.passed ? 'text-primary' : 'text-destructive')}>
            {result?.accuracy}%
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">Mistakes</dt>
          <dd className="font-mono text-3xl font-medium tabular-nums">{mistakes}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">Speed</dt>
          <dd className="font-mono text-3xl font-medium tabular-nums">{result?.wpm} wpm</dd>
        </div>
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        {result?.passed && hasNext && (
          <button
            type="button"
            onClick={() => openLesson(lessonIndex + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Next lesson
          </button>
        )}
        <button
          type="button"
          onClick={startDrill}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            result?.passed && hasNext ? 'border border-border bg-card text-foreground' : 'bg-primary text-primary-foreground',
          )}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
        <button
          type="button"
          onClick={() => setPhase('list')}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          All lessons
        </button>
      </div>
    </section>
  )
}

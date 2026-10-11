import { memo, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

function Caret() {
  return (
    <span className="relative" aria-hidden="true">
      {'\u200b'}
      <span className="absolute -left-px top-1/2 h-[1.1em] w-0.5 -translate-y-1/2 animate-pulse rounded-full bg-primary" />
    </span>
  )
}

const Word = memo(function Word({
  target,
  input,
  state,
}: {
  target: string
  input: string
  state: 'done' | 'active' | 'pending'
}) {
  const isWrongWord = state === 'done' && input !== target
  const extra = input.slice(target.length)

  return (
    <span className={cn('whitespace-nowrap', isWrongWord && 'underline decoration-destructive/70 decoration-2 underline-offset-[6px]')}>
      {target.split('').map((char, i) => {
        const typedChar = input[i]
        let color = 'text-muted-foreground/60'
        if (typedChar !== undefined) {
          color = typedChar === char ? 'text-foreground' : 'text-destructive'
        } else if (state === 'done') {
          color = 'text-muted-foreground/60'
        }
        return (
          <span key={i} className={color}>
            {state === 'active' && i === input.length && <Caret />}
            {char}
          </span>
        )
      })}
      {extra.split('').map((char, i) => (
        <span key={`x${i}`} className="text-destructive/60">
          {char}
        </span>
      ))}
      {state === 'active' && input.length >= target.length && <Caret />}
    </span>
  )
})

export function WordDisplay({
  words,
  typed,
  current,
  blurred,
}: {
  words: string[]
  typed: string[]
  current: string
  blurred: boolean
}) {
  const activeIndex = typed.length
  const activeRef = useRef<HTMLSpanElement>(null)
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    const el = activeRef.current
    if (!el) return
    setOffset(Math.max(el.offsetTop - el.offsetHeight, 0))
  }, [activeIndex])

  return (
    <div
      className={cn(
        'h-[8.25rem] overflow-hidden font-mono text-2xl leading-[2.75rem] transition-[filter,opacity] duration-200 md:text-3xl',
        blurred && 'opacity-40 blur-sm',
      )}
      aria-hidden="true"
    >
      <div
        className="relative flex flex-wrap gap-x-[0.6em] transition-transform duration-150"
        style={{ transform: `translateY(-${offset}px)` }}
      >
        {words.map((word, i) => {
          const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
          const input = i < activeIndex ? typed[i] : i === activeIndex ? current : ''
          return (
            <span key={i} ref={i === activeIndex ? activeRef : undefined}>
              <Word target={word} input={input} state={state} />
            </span>
          )
        })}
      </div>
    </div>
  )
}

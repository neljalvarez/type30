import { FINGERS, FINGER_FOR, KEY_ROWS } from '@/lib/lessons'
import { cn } from '@/lib/utils'

const ROW_OFFSET = ['', 'ml-[0.5rem] sm:ml-[1.25rem]', 'ml-[1.25rem] sm:ml-[2.5rem]']

function keyColors(key: string, strong: boolean) {
  const finger = FINGER_FOR[key]
  const hue = FINGERS[finger].hue
  if (finger === 'thumb') {
    return {
      backgroundColor: strong ? 'var(--primary)' : 'var(--secondary)',
      borderColor: strong ? 'var(--primary)' : 'var(--border)',
    }
  }
  return {
    backgroundColor: strong ? `hsl(${hue} 80% 50%)` : `hsl(${hue} 75% 55% / 0.22)`,
    borderColor: strong ? `hsl(${hue} 80% 40%)` : `hsl(${hue} 70% 50% / 0.65)`,
  }
}

/**
 * On-screen QWERTY keys colored by the finger that should press them.
 * `next` is the key to press now, `focus` marks keys the lesson teaches,
 * and `wrong` flashes a key the learner pressed by mistake.
 */
export function KeyboardGuide({ next, focus = '', wrong }: { next?: string; focus?: string; wrong?: string | null }) {
  return (
    <div className="flex w-full flex-col items-center gap-1 sm:gap-1.5" role="img" aria-label="Keyboard with finger colors">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={cn('flex gap-1 sm:gap-1.5', ROW_OFFSET[rowIndex])}>
          {row.map((key) => {
            const isNext = next === key
            const isWrong = wrong === key
            const isFocus = focus.includes(key)
            return (
              <span
                key={key}
                style={isWrong ? undefined : keyColors(key, isNext)}
                className={cn(
                  'relative flex size-7 items-center justify-center rounded-md border-2 font-mono text-xs font-semibold uppercase transition-transform sm:size-10 sm:text-base',
                  isNext ? 'z-10 scale-110 text-white shadow-[0_0_0_3px_var(--foreground)]' : 'text-foreground',
                  isFocus && !isNext && 'ring-2 ring-foreground/70 ring-offset-1 ring-offset-background',
                  isWrong && 'pixel-shake border-destructive bg-destructive text-background',
                )}
              >
                {key}
                {(key === 'f' || key === 'j') && (
                  <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-current opacity-70" aria-hidden="true" />
                )}
              </span>
            )
          })}
        </div>
      ))}
      <span
        style={keyColors(' ', next === ' ')}
        className={cn(
          'mt-0.5 flex h-7 w-40 items-center justify-center rounded-md border-2 font-mono text-[10px] uppercase tracking-widest transition-transform sm:h-10 sm:w-64 sm:text-xs',
          next === ' ' ? 'z-10 scale-105 text-primary-foreground shadow-[0_0_0_3px_var(--foreground)]' : 'text-muted-foreground',
          wrong === ' ' && 'pixel-shake',
        )}
      >
        space
      </span>
    </div>
  )
}

export function FingerLegend() {
  const entries = (Object.keys(FINGERS) as (keyof typeof FINGERS)[]).filter((f) => f !== 'thumb')
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Finger colors">
      {entries.map((finger) => (
        <li key={finger} className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border" style={{ backgroundColor: `hsl(${FINGERS[finger].hue} 75% 55% / 0.5)`, borderColor: `hsl(${FINGERS[finger].hue} 70% 50%)` }} aria-hidden="true" />
          {FINGERS[finger].label}
        </li>
      ))}
    </ul>
  )
}

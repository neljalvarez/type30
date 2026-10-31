export type SecondSample = {
  second: number
  wpm: number
  raw: number
  errors: number
}

export type KeyStats = Record<string, { hits: number; misses: number }>

export type WordTiming = {
  word: string
  typed: string
  ms: number
}

export type BossResult = {
  tierId: string
  name: string
  wpm: number
  /** Characters the boss had typed when the fight ended. */
  chars: number
  playerChars: number
  /** Whether you finished the passage before the boss. */
  won: boolean
  /** How long the fight lasted, in seconds. */
  seconds: number
  song: string
}

export type TypingStats = {
  wpm: number
  rawWpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  wordsTyped: number
  wordsMissed: number
  backspaces: number
  consistency: number
  peakWpm: number
  samples: SecondSample[]
  keyStats: KeyStats
  wordTimings: WordTiming[]
  boss: BossResult | null
}

export function countCorrectChars(words: string[], typed: string[], current: string) {
  let count = 0
  typed.forEach((word, i) => {
    if (word === words[i]) count += word.length + 1
  })
  const target = words[typed.length]
  if (target && current && target.startsWith(current)) count += current.length
  return count
}

export function toWpm(chars: number, seconds: number) {
  if (seconds <= 0) return 0
  return Math.round(chars / 5 / (seconds / 60))
}

export function computeConsistency(values: number[]) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 0
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.max(0, Math.round(100 * (1 - Math.sqrt(variance) / mean)))
}

export function wordWpm(timing: WordTiming) {
  if (timing.ms <= 0) return 0
  return Math.round((timing.word.length + 1) / 5 / (timing.ms / 60000))
}

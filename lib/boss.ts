export type BossTier = {
  id: string
  name: string
  wpm: number
  tagline: string
}

export const BOSS_TIERS: BossTier[] = [
  { id: 'rookie', name: 'Rookie Bot', wpm: 35, tagline: 'Warming up' },
  { id: 'keysmith', name: 'Keysmith', wpm: 55, tagline: 'Steady hands' },
  { id: 'demon', name: 'Speed Demon', wpm: 80, tagline: 'No mercy' },
  { id: 'overlord', name: 'The Overlord', wpm: 110, tagline: 'Final boss' },
]

export const CUSTOM_BOSS_MIN = 20
export const CUSTOM_BOSS_MAX = 200

export type BossConfig = {
  tierId: string
  name: string
  wpm: number
}

/** Characters the boss has typed after `seconds`. A small wobble makes its pace feel human while staying monotonic. */
export function bossCharsAt(wpm: number, seconds: number) {
  if (seconds <= 0) return 0
  const rate = (wpm * 5) / 60
  return Math.max(0, rate * (seconds + (0.3 * Math.sin(seconds * 1.7)) / 1.7))
}

export function bossPosition(words: string[], chars: number) {
  let remaining = Math.floor(chars)
  for (let i = 0; i < words.length; i++) {
    const length = words[i].length + 1
    if (remaining < length) return { word: i, char: remaining }
    remaining -= length
  }
  return { word: words.length - 1, char: words[words.length - 1]?.length ?? 0 }
}

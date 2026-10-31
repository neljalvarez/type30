import { SONGS } from '@/lib/chiptune'

export type BossTier = {
  id: string
  name: string
  wpm: number
  tagline: string
  color: string
  song: string
}

export const BOSS_TIERS: BossTier[] = [
  { id: 'rookie', name: 'Rookie Bot', wpm: 35, tagline: 'Warming up', color: '#4DA3FF', song: SONGS.rookie.title },
  { id: 'keysmith', name: 'Keysmith', wpm: 55, tagline: 'Steady hands', color: '#F2A93B', song: SONGS.keysmith.title },
  { id: 'demon', name: 'Speed Demon', wpm: 80, tagline: 'No mercy', color: '#E5322D', song: SONGS.demon.title },
  { id: 'overlord', name: 'The Overlord', wpm: 110, tagline: 'Final boss', color: '#9B5DE5', song: SONGS.overlord.title },
]

export const CUSTOM_BOSS_COLOR = '#5BC27A'
export const CUSTOM_BOSS_SONG = 'Custom Chaos'
export const CUSTOM_BOSS_MIN = 20
export const CUSTOM_BOSS_MAX = 200

/** Boss fights are a race to the end of a fixed passage rather than a 30 second timer. */
export const BOSS_WORDS = 40
/** If the boss gets this many characters ahead of you, you lose (like running out of health). */
export const BOSS_LOSE_GAP = 50

export type BossConfig = {
  tierId: string
  name: string
  wpm: number
}

export function bossTheme(tierId: string) {
  const tier = BOSS_TIERS.find((t) => t.id === tierId)
  return {
    color: tier?.color ?? CUSTOM_BOSS_COLOR,
    song: tier?.song ?? CUSTOM_BOSS_SONG,
  }
}

/** Total characters in the passage, counting the space after every word (what a perfect run types). */
export function passageChars(words: string[]) {
  return words.reduce((sum, word) => sum + word.length + 1, 0)
}

/** 0-100 where 100 means you are far ahead and 0 means you lost. Starts at 50. */
export function bossHealth(playerChars: number, bossChars: number) {
  const health = 50 + ((playerChars - bossChars) / BOSS_LOSE_GAP) * 50
  return Math.min(100, Math.max(0, health))
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

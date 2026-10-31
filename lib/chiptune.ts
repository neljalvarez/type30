/**
 * Tiny 8-bit sound engine built on the Web Audio API. No audio files: every
 * note is a pulse/triangle/noise voice, scheduled a little ahead of time.
 */

export type Song = {
  title: string
  bpm: number
  /** Pulse width of the lead voice (0.125, 0.25 or 0.5 sound the most "NES"). */
  duty: number
  /** One entry per bar. A bar is eight eighth-note steps. */
  bars: { root: string; quality: 'maj' | 'min'; lead: string }[]
  /** Bass offsets in semitones from the chord root, one per step (null = rest). */
  bass: (number | null)[]
  /** k = kick, s = snare, h = hat, b = kick + hat, c = snare + hat, . = rest. */
  drums: string
}

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export function noteToMidi(name: string): number | null {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(name)
  if (!match) return null
  const [, letter, accidental, octave] = match
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  return 12 * (Number(octave) + 1) + NOTE_INDEX[letter] + shift
}

const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const SONGS: Record<string, Song> = {
  rookie: {
    title: 'Boot Sequence',
    bpm: 124,
    duty: 0.25,
    bass: [0, null, 0, null, 7, null, 0, null],
    drums: 'k.h.s.h.',
    bars: [
      { root: 'C3', quality: 'maj', lead: 'E5 . G5 E5 C5 . E5 .' },
      { root: 'A2', quality: 'min', lead: 'E5 . A5 E5 C5 . E5 .' },
      { root: 'F3', quality: 'maj', lead: 'F5 . A5 F5 C5 . F5 .' },
      { root: 'G2', quality: 'maj', lead: 'D5 . G5 B5 . D6 . .' },
      { root: 'C3', quality: 'maj', lead: 'G5 . E5 C5 E5 G5 C6 .' },
      { root: 'A2', quality: 'min', lead: 'A5 . E5 C5 E5 A5 . .' },
      { root: 'F3', quality: 'maj', lead: 'A5 G5 F5 E5 F5 . A5 .' },
      { root: 'G2', quality: 'maj', lead: 'G5 . D5 B4 D5 G5 . .' },
    ],
  },
  keysmith: {
    title: 'Forge Hammer',
    bpm: 134,
    duty: 0.5,
    bass: [0, null, 0, 12, 0, null, 7, null],
    drums: 'bhchbhch',
    bars: [
      { root: 'A2', quality: 'min', lead: 'A4 C5 E5 A5 E5 C5 E5 .' },
      { root: 'F2', quality: 'maj', lead: 'F4 A4 C5 F5 C5 A4 C5 .' },
      { root: 'G2', quality: 'maj', lead: 'G4 B4 D5 G5 D5 B4 D5 .' },
      { root: 'E2', quality: 'min', lead: 'E5 G5 B5 G5 E5 B4 E5 .' },
      { root: 'A2', quality: 'min', lead: 'E5 . E5 A5 . G5 E5 .' },
      { root: 'F2', quality: 'maj', lead: 'F5 . F5 A5 . G5 F5 .' },
      { root: 'G2', quality: 'maj', lead: 'D5 . D5 G5 . F5 D5 .' },
      { root: 'E2', quality: 'maj', lead: 'E5 G#5 B5 . E6 . . .' },
    ],
  },
  demon: {
    title: 'Hellfire Hotkeys',
    bpm: 168,
    duty: 0.125,
    bass: [0, 0, 0, 12, 0, 0, 12, 0],
    drums: 'bhcbbhch',
    bars: [
      { root: 'E2', quality: 'min', lead: 'E5 G5 B5 E6 B5 G5 B5 E6' },
      { root: 'C3', quality: 'maj', lead: 'C5 E5 G5 C6 G5 E5 G5 C6' },
      { root: 'G2', quality: 'maj', lead: 'B4 D5 G5 B5 G5 D5 G5 B5' },
      { root: 'D3', quality: 'maj', lead: 'A4 D5 F#5 A5 F#5 D5 F#5 A5' },
      { root: 'E2', quality: 'min', lead: 'E6 . B5 E6 . G6 F#6 E6' },
      { root: 'C3', quality: 'maj', lead: 'E6 . C6 E6 . G6 E6 C6' },
      { root: 'D3', quality: 'maj', lead: 'D6 . A5 D6 . F#6 E6 D6' },
      { root: 'B2', quality: 'maj', lead: 'B5 D#6 F#6 . B6 . . .' },
    ],
  },
  overlord: {
    title: 'Final Keystroke',
    bpm: 180,
    duty: 0.25,
    bass: [0, 12, 0, 12, 0, 12, 0, 12],
    drums: 'bbcbbbcc',
    bars: [
      { root: 'D3', quality: 'min', lead: 'D5 . F5 A5 D6 . A5 F5' },
      { root: 'Bb2', quality: 'maj', lead: 'D5 . F5 Bb5 D6 . Bb5 F5' },
      { root: 'G2', quality: 'min', lead: 'D5 . G5 Bb5 D6 . Bb5 G5' },
      { root: 'A2', quality: 'maj', lead: 'C#5 . E5 A5 C#6 . A5 E5' },
      { root: 'D3', quality: 'min', lead: 'A5 . D6 . F6 . E6 D6' },
      { root: 'Bb2', quality: 'maj', lead: 'F6 . D6 . Bb5 . D6 F6' },
      { root: 'G2', quality: 'min', lead: 'Bb5 . D6 . G6 . F6 D6' },
      { root: 'A2', quality: 'maj', lead: 'E6 . C#6 . A5 . E5 .' },
    ],
  },
}

/** Custom bosses reuse a theme but follow the boss's speed. */
export function songForBoss(tierId: string, wpm: number): Song {
  const known = SONGS[tierId]
  if (known) return known
  return { ...SONGS.keysmith, title: 'Custom Chaos', bpm: Math.round(Math.min(Math.max(96 + wpm * 0.45, 104), 190)) }
}

const MUTE_KEY = 'type30-muted'

let ctx: AudioContext | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = false
let mutedLoaded = false
const mutedListeners = new Set<() => void>()
const waves = new Map<number, PeriodicWave>()

let timer: ReturnType<typeof setInterval> | null = null
let nextTime = 0
let step = 0
let playing: Song | null = null

function loadMuted() {
  if (mutedLoaded) return
  mutedLoaded = true
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    muted = false
  }
}

export function isMuted() {
  loadMuted()
  return muted
}

export function subscribeMuted(callback: () => void) {
  mutedListeners.add(callback)
  return () => {
    mutedListeners.delete(callback)
  }
}

export function setMuted(next: boolean) {
  loadMuted()
  muted = next
  try {
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  } catch {
    // Persisting the choice is a nicety; ignore blocked storage.
  }
  if (next) stopMusic()
  mutedListeners.forEach((listener) => listener())
}

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    musicGain = ctx.createGain()
    musicGain.gain.value = 0.55
    musicGain.connect(ctx.destination)
    sfxGain = ctx.createGain()
    sfxGain.gain.value = 0.7
    sfxGain.connect(ctx.destination)

    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function pulseWave(audio: AudioContext, duty: number) {
  let wave = waves.get(duty)
  if (!wave) {
    const size = 32
    const real = new Float32Array(size)
    const imag = new Float32Array(size)
    for (let n = 1; n < size; n++) imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty)
    wave = audio.createPeriodicWave(real, imag)
    waves.set(duty, wave)
  }
  return wave
}

type Voice = 'pulse' | 'triangle' | 'square'

function tone(opts: {
  freq: number
  start: number
  length: number
  volume: number
  voice: Voice
  duty?: number
  slideTo?: number
  out: GainNode
}) {
  const audio = ctx
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  if (opts.voice === 'pulse') osc.setPeriodicWave(pulseWave(audio, opts.duty ?? 0.25))
  else osc.type = opts.voice === 'triangle' ? 'triangle' : 'square'
  osc.frequency.setValueAtTime(opts.freq, opts.start)
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, opts.start + opts.length)
  gain.gain.setValueAtTime(0.0001, opts.start)
  gain.gain.linearRampToValueAtTime(opts.volume, opts.start + 0.004)
  gain.gain.exponentialRampToValueAtTime(opts.volume * 0.55, opts.start + opts.length * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.length)
  osc.connect(gain)
  gain.connect(opts.out)
  osc.start(opts.start)
  osc.stop(opts.start + opts.length + 0.02)
}

function noise(start: number, length: number, volume: number, highpass: number, out: GainNode) {
  const audio = ctx
  if (!audio || !noiseBuffer) return
  const source = audio.createBufferSource()
  source.buffer = noiseBuffer
  const filter = audio.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = highpass
  const gain = audio.createGain()
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(out)
  source.start(start, Math.random() * 0.5)
  source.stop(start + length + 0.02)
}

function chordNotes(root: number, quality: 'maj' | 'min') {
  return [root, root + (quality === 'maj' ? 4 : 3), root + 7]
}

function scheduleStep(song: Song, index: number, time: number, stepLength: number) {
  if (!musicGain) return
  const bar = song.bars[Math.floor(index / 8) % song.bars.length]
  const inBar = index % 8
  const leadName = bar.lead.split(' ')[inBar]
  const lead = leadName && leadName !== '.' ? noteToMidi(leadName) : null
  if (lead !== null) {
    tone({ freq: midiToHz(lead), start: time, length: stepLength * 0.92, volume: 0.1, voice: 'pulse', duty: song.duty, out: musicGain })
  }

  const rootMidi = noteToMidi(bar.root) ?? 48
  const offset = song.bass[inBar]
  if (offset !== null && offset !== undefined) {
    tone({ freq: midiToHz(rootMidi + offset), start: time, length: stepLength * 0.85, volume: 0.2, voice: 'triangle', out: musicGain })
  }

  // A quiet chord stab on the first step of each bar fills out the sound.
  if (inBar === 0) {
    chordNotes(rootMidi + 24, bar.quality).forEach((note, i) => {
      tone({ freq: midiToHz(note), start: time + i * 0.012, length: stepLength * 1.6, volume: 0.035, voice: 'pulse', duty: 0.125, out: musicGain! })
    })
  }

  const hit = song.drums[inBar] ?? '.'
  if (hit === 'k' || hit === 'b') {
    tone({ freq: 160, slideTo: 40, start: time, length: 0.12, volume: 0.3, voice: 'square', out: musicGain })
  }
  if (hit === 's' || hit === 'c') noise(time, 0.11, 0.2, 1200, musicGain)
  if (hit === 'h' || hit === 'b' || hit === 'c') noise(time, 0.04, 0.07, 6000, musicGain)
}

export function startMusic(song: Song) {
  if (isMuted()) return
  stopMusic()
  const audio = getContext()
  if (!audio) return
  playing = song
  step = 0
  nextTime = audio.currentTime + 0.08
  const stepLength = 60 / song.bpm / 2

  const tick = () => {
    if (!ctx || !playing) return
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(playing, step, nextTime, stepLength)
      nextTime += stepLength
      step += 1
    }
  }
  tick()
  timer = setInterval(tick, 40)
}

export function stopMusic() {
  if (timer) clearInterval(timer)
  timer = null
  playing = null
}

function sfx(play: (audio: AudioContext, out: GainNode, now: number) => void) {
  if (isMuted()) return
  const audio = getContext()
  if (!audio || !sfxGain) return
  play(audio, sfxGain, audio.currentTime)
}

export const sfxKey = () =>
  sfx((_, out, now) => tone({ freq: 700 + Math.random() * 120, start: now, length: 0.04, volume: 0.07, voice: 'square', out }))

export const sfxError = () =>
  sfx((_, out, now) => {
    tone({ freq: 140, slideTo: 90, start: now, length: 0.12, volume: 0.14, voice: 'square', out })
    noise(now, 0.08, 0.1, 800, out)
  })

export const sfxWord = () =>
  sfx((_, out, now) => {
    tone({ freq: 880, start: now, length: 0.05, volume: 0.09, voice: 'square', out })
    tone({ freq: 1320, start: now + 0.05, length: 0.08, volume: 0.09, voice: 'square', out })
  })

export const sfxSelect = () =>
  sfx((_, out, now) => {
    tone({ freq: 520, start: now, length: 0.05, volume: 0.09, voice: 'square', out })
    tone({ freq: 780, start: now + 0.05, length: 0.07, volume: 0.09, voice: 'square', out })
  })

export const sfxCountdown = (final: boolean) =>
  sfx((_, out, now) => {
    if (final) {
      tone({ freq: 1046, start: now, length: 0.35, volume: 0.14, voice: 'square', out })
      tone({ freq: 1568, start: now + 0.02, length: 0.3, volume: 0.08, voice: 'pulse', duty: 0.25, out })
    } else {
      tone({ freq: 523, start: now, length: 0.14, volume: 0.12, voice: 'square', out })
    }
  })

export const sfxWin = () =>
  sfx((_, out, now) => {
    ;[523, 659, 784, 1046, 784, 1046].forEach((freq, i) => {
      tone({ freq, start: now + i * 0.11, length: i === 5 ? 0.45 : 0.1, volume: 0.13, voice: 'square', out })
    })
  })

export const sfxLose = () =>
  sfx((_, out, now) => {
    ;[392, 370, 349, 330].forEach((freq, i) => {
      tone({ freq, slideTo: freq * 0.96, start: now + i * 0.18, length: i === 3 ? 0.6 : 0.16, volume: 0.13, voice: 'triangle', out })
    })
  })

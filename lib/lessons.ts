export type Finger = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'thumb'

export const FINGERS: Record<Finger, { label: string; hue: number }> = {
  lp: { label: 'left pinky', hue: 335 },
  lr: { label: 'left ring finger', hue: 22 },
  lm: { label: 'left middle finger', hue: 48 },
  li: { label: 'left index finger', hue: 140 },
  ri: { label: 'right index finger', hue: 185 },
  rm: { label: 'right middle finger', hue: 220 },
  rr: { label: 'right ring finger', hue: 265 },
  rp: { label: 'right pinky', hue: 305 },
  thumb: { label: 'thumb', hue: 0 },
}

export const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]

const FINGER_KEYS: Record<Exclude<Finger, 'thumb'>, string> = {
  lp: 'qaz',
  lr: 'wsx',
  lm: 'edc',
  li: 'rfvtgb',
  ri: 'yhnujm',
  rm: 'ik,',
  rr: 'ol.',
  rp: 'p;/',
}

export const FINGER_FOR: Record<string, Finger> = { ' ': 'thumb' }
for (const [finger, keys] of Object.entries(FINGER_KEYS)) {
  for (const key of keys) FINGER_FOR[key] = finger as Finger
}

export type LessonKind = 'info' | 'keys' | 'words' | 'sentences'

export type Lesson = {
  id: string
  title: string
  blurb: string
  tips: string[]
  kind: LessonKind
  /** Keys practiced in a "keys" lesson. */
  pool?: string
  /** Keys this lesson introduces; they get extra practice and are marked on the keyboard. */
  focus?: string
}

export const LESSONS: Lesson[] = [
  {
    id: 'posture',
    title: 'Sit like a typist',
    blurb: 'Posture and setup, the part everyone skips',
    kind: 'info',
    tips: [
      'Sit up with your back supported and both feet flat on the floor.',
      'Bend your elbows to about 90 degrees and keep them close to your body.',
      'Let your wrists float just above the keyboard. Resting them on the desk edge strains them.',
      'Put the screen at eye level, about an arm’s length away.',
      'Keep your eyes on the screen, never on the keys. This habit matters more than anything else here.',
      'Relax your shoulders, and stand up and stretch every half hour.',
    ],
  },
  {
    id: 'home',
    title: 'Home row',
    blurb: 'A S D F  J K L ;  where your fingers live',
    kind: 'keys',
    pool: 'asdfjkl;',
    focus: 'asdfjkl;',
    tips: [
      'Rest your left fingers on A S D F and your right fingers on J K L ;.',
      'Feel for the small bumps on F and J. They let you find home without looking.',
      'Hover both thumbs over the space bar. Either thumb works.',
      'After every key, bring that finger straight back to its home key.',
      'Go slowly and be accurate. Speed comes by itself later.',
    ],
  },
  {
    id: 'index',
    title: 'Index fingers: G and H',
    blurb: 'Your busiest fingers cover two columns each',
    kind: 'keys',
    pool: 'asdfjkl;gh',
    focus: 'gh',
    tips: [
      'Your index fingers work the hardest. Each one covers two columns of keys.',
      'Left index: R F V and T G B. Right index: Y H N and U J M.',
      'Slide the finger sideways to G or H, then slide it back to F or J.',
      'Keep your other fingers resting on the home row while one finger reaches.',
    ],
  },
  {
    id: 'top',
    title: 'Top row',
    blurb: 'Q W E R T  Y U I O P',
    kind: 'keys',
    pool: 'asdfjkl;ghqwertyuiop',
    focus: 'qwertyuiop',
    tips: [
      'Reach up with the same finger that owns that column, then drop back to home.',
      'Your fingers stay curved, like holding a small ball.',
      'E and I are your middle fingers. They have the longest reach, so keep them relaxed.',
      'If you miss, don’t look down. Return to home and try again.',
    ],
  },
  {
    id: 'bottom',
    title: 'Bottom row',
    blurb: 'Z X C V B  N M , . /',
    kind: 'keys',
    pool: 'asdfjkl;ghqwertyuiopzxcvbnm,./',
    focus: 'zxcvbnm,./',
    tips: [
      'Reach down by curling the finger toward your palm. Don’t lift your whole hand.',
      'Your pinkies are the weakest fingers, so go extra slow on Z and /.',
      'V and N are index finger keys. B and M are too, so slide inward from home.',
      'Return to the home row every time, even when the next key is nearby.',
    ],
  },
  {
    id: 'words',
    title: 'Real words',
    blurb: 'Put the letters together',
    kind: 'words',
    tips: [
      'Type each word as one smooth motion, not letter by letter.',
      'Aim for an even rhythm. Steady beats fast with stops and starts.',
      'Use a thumb for every space. Make it part of the rhythm.',
      'Stay at 95% accuracy or better before you push for speed.',
    ],
  },
  {
    id: 'sentences',
    title: 'Sentences',
    blurb: 'Everything together, without looking down',
    kind: 'sentences',
    tips: [
      'Keep your eyes on the text. Trust your fingers to find the keys.',
      'Read a word or two ahead of what you are typing.',
      'Don’t stop to fix every slip. Keep the rhythm and let accuracy build.',
      'When this feels easy, head to SOLO MODE and see your speed.',
    ],
  },
]

const EASY_WORDS = [
  'add', 'ask', 'dad', 'fall', 'flag', 'glad', 'hall', 'half', 'jazz', 'lake', 'lass', 'salad', 'shall', 'slag',
  'its', 'old', 'out', 'pit', 'pop', 'quit', 'rope', 'sort', 'tire', 'type', 'wipe', 'wire', 'write', 'your',
  'bank', 'band', 'cave', 'cabin', 'move', 'name', 'next', 'numb', 'vase', 'zone', 'maze', 'brave', 'crazy',
  'quick', 'brown', 'jumps', 'plain', 'light', 'drive', 'north', 'river', 'happy', 'house', 'water', 'green',
]

const SENTENCES = [
  'the quick brown fox jumps over the lazy dog.',
  'a good typist keeps eyes on the screen.',
  'slow and steady is how fingers learn.',
  'keep your wrists up and your shoulders loose.',
  'every expert typist started with the home row.',
  'type the way you walk, one calm step at a time.',
  'my fingers find the keys without a map.',
]

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

/** Builds the text for one drill. Uses Math.random, so call it from an event handler, never during render. */
export function buildDrill(lesson: Lesson): string {
  if (lesson.kind === 'words') {
    return Array.from({ length: 12 }, () => pick(EASY_WORDS)).join(' ')
  }
  if (lesson.kind === 'sentences') {
    const first = pick(SENTENCES)
    let second = pick(SENTENCES)
    while (second === first) second = pick(SENTENCES)
    return `${first} ${second}`
  }

  const pool = lesson.pool ?? 'asdfjkl;'
  // New keys appear twice as often so they get the practice.
  const weighted = (pool + (lesson.focus ?? '')).split('')
  const groups: string[] = []
  let length = 0
  while (length < 40) {
    const size = 3 + Math.floor(Math.random() * 3)
    let group = ''
    for (let i = 0; i < size; i++) group += pick(weighted)
    groups.push(group)
    length += size + 1
  }
  return groups.join(' ')
}

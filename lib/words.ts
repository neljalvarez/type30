const COMMON_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'with', 'as',
  'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one',
  'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man',
  'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only',
  'new', 'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first',
  'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also',
  'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much',
  'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem',
  'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life',
  'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call',
  'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another',
  'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off',
  'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person',
  'end', 'open', 'public', 'follow', 'during', 'present', 'without', 'again', 'hold', 'govern', 'around',
  'possible', 'head', 'consider', 'word', 'program', 'problem', 'however', 'lead', 'system', 'set',
  'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact', 'group', 'play', 'stand', 'increase', 'early',
  'course', 'change', 'help', 'line', 'city', 'light', 'water', 'quick', 'river', 'music', 'garden',
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateWords(seed: number, count = 200): string[] {
  const random = mulberry32(seed)
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    let next = COMMON_WORDS[Math.floor(random() * COMMON_WORDS.length)]
    while (next === words[i - 1]) {
      next = COMMON_WORDS[Math.floor(random() * COMMON_WORDS.length)]
    }
    words.push(next)
  }
  return words
}

// Pure guess-the-number engine. Ported from legacy/bob-guess-game.html.
// Bob always answers truthfully and always counts a valid guess; the [lo,hi]
// range only clamps when the guess is inside it.

export interface BobBubble {
  text: string
  kind: 'normal' | 'found' | 'invalid'
}

export interface BobState {
  target: number
  lo: number
  hi: number
  guessCount: number
  gameOver: boolean
  marks: { value: number; latest: boolean }[]
  youFace: string
  bobFace: string
  bubbleYou: string | null
  bubbleBob: BobBubble | null
  rangeLabel: string
  rangeWon: boolean
  hintHtml: string | null
}

// Bob's faces, getting progressively more rattled.
const BOB_FACES = ['😏', '😏', '🙂', '🤨', '😐', '😟', '😨', '🤯']

export function optimalHint(count: number): string {
  if (count <= 7) {
    return `🎉 Solved in ${count} guess${count === 1 ? '' : 'es'}. Optimal binary search needs ⌈log₂(101)⌉ = 7 in the worst case — you're at or below that.`
  }
  if (count <= 10) {
    return `Solved in ${count} guesses. Binary search would have found it in at most 7. Try guessing the midpoint of the current range each time.`
  }
  return `Solved in ${count} guesses. Binary search guarantees 7 or fewer — always guess the middle of the current <code>[l, r]</code> range.`
}

export function newGame(opts?: { first?: boolean; rng?: () => number }): BobState {
  const first = opts?.first ?? false
  const rng = opts?.rng ?? Math.random
  const target = first ? 67 : Math.floor(rng() * 101)
  return {
    target,
    lo: 0,
    hi: 100,
    guessCount: 0,
    gameOver: false,
    marks: [],
    youFace: '🤔',
    bobFace: '😏',
    bubbleYou: null,
    bubbleBob: null,
    rangeLabel: 'Possible scores: [0, 100]',
    rangeWon: false,
    hintHtml: null,
  }
}

export function guess(prev: BobState, raw: string): BobState {
  if (prev.gameOver) return prev
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ...prev, bubbleBob: { text: 'Type a number first!', kind: 'invalid' } }
  }
  const g = Number(trimmed)
  if (!Number.isInteger(g) || g < 0 || g > 100) {
    return { ...prev, bubbleBob: { text: 'It has to be 0-100, integer.', kind: 'invalid' } }
  }

  const guessCount = prev.guessCount + 1
  const marks = [
    ...prev.marks.map((m) => ({ ...m, latest: false })),
    { value: g, latest: true },
  ]
  const s: BobState = {
    ...prev,
    guessCount,
    marks,
    bubbleYou: `Is it ${g}?`,
  }

  if (g === prev.target) {
    s.gameOver = true
    s.bobFace = guessCount <= 7 ? '🤯' : '😅'
    s.bubbleBob = { text: `Yes! ${prev.target}!`, kind: 'found' }
    s.rangeWon = true
    s.rangeLabel = `Bob's score = ${prev.target}`
    s.hintHtml = optimalHint(guessCount)
    return s
  }

  const faceIdx = Math.min(BOB_FACES.length - 1, Math.floor(guessCount * 1.2))
  s.bobFace = BOB_FACES[faceIdx]
  if (g < prev.target) {
    if (g >= prev.lo) s.lo = g + 1
    s.bubbleBob = { text: 'Higher!', kind: 'normal' }
  } else {
    if (g <= prev.hi) s.hi = g - 1
    s.bubbleBob = { text: 'Lower!', kind: 'normal' }
  }
  s.rangeLabel = `Possible scores: [${s.lo}, ${s.hi}]`
  return s
}

/** Convenience for stats display. */
export function rangeSize(s: BobState): number {
  return s.hi - s.lo + 1
}

import { describe, it, expect } from 'vitest'
import { newGame, guess, rangeSize, type BobState } from './bobEngine'

function game(target: number): BobState {
  // seed a deterministic non-first game with the desired target
  return newGame({ rng: () => target / 101 })
}

describe('newGame', () => {
  it('first game target is always 67', () => {
    expect(newGame({ first: true }).target).toBe(67)
  })
  it('subsequent games use the rng (0-100)', () => {
    expect(newGame({ rng: () => 0 }).target).toBe(0)
    expect(newGame({ rng: () => 0.999 }).target).toBe(100) // floor(0.999*101)=100, span 0..100
    expect(newGame({ rng: () => 0.5 }).target).toBe(50)
  })
})

describe('guessing', () => {
  it('answers Higher and counts when guess < target', () => {
    const s = guess(game(67), '50')
    expect(s.bubbleBob?.text).toBe('Higher!')
    expect(s.guessCount).toBe(1)
    expect(s.lo).toBe(51) // clamped (50 was within [0,100])
  })

  it('answers Lower and counts when guess > target', () => {
    const s = guess(game(67), '80')
    expect(s.bubbleBob?.text).toBe('Lower!')
    expect(s.hi).toBe(79)
  })

  it('still answers + counts an out-of-range guess but does not move the range', () => {
    let s = game(67)
    s = guess(s, '40') // lo -> 41
    expect(s.lo).toBe(41)
    s = guess(s, '20') // 20 < lo(41): truthful Higher!, counts, but range unchanged
    expect(s.bubbleBob?.text).toBe('Higher!')
    expect(s.guessCount).toBe(2)
    expect(s.lo).toBe(41)
  })

  it('rejects empty and out-of-bounds without counting', () => {
    const empty = guess(game(67), '')
    expect(empty.bubbleBob?.kind).toBe('invalid')
    expect(empty.guessCount).toBe(0)
    const bad = guess(game(67), '101')
    expect(bad.bubbleBob?.text).toBe('It has to be 0-100, integer.')
    expect(bad.guessCount).toBe(0)
  })

  it('wins with 🤯 in <=7 guesses and 😅 otherwise', () => {
    const quick = guess(game(67), '67')
    expect(quick.gameOver).toBe(true)
    expect(quick.bobFace).toBe('🤯')
    expect(quick.rangeWon).toBe(true)
    expect(quick.hintHtml).toContain('Optimal binary search')

    // 8 guesses to win -> 😅
    let s = game(67)
    for (const g of ['1', '2', '3', '4', '5', '6', '7']) s = guess(s, g)
    s = guess(s, '67')
    expect(s.bobFace).toBe('😅')
  })

  it('rangeSize reflects the narrowing window', () => {
    expect(rangeSize(game(67))).toBe(101)
  })
})

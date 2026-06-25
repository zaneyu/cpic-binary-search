import { describe, it, expect } from 'vitest'
import { initSearch, stepSearch, type SearchState, type Mode } from './searchEngine'

function run(arr: number[], mode: Mode, target: number): SearchState {
  let s = initSearch(arr, mode, target)
  let guard = 0
  while (!s.finished && guard++ < 100) s = stepSearch(s)
  return s
}

const ARR = [2, 2, 3, 5, 6, 7, 8]

describe('equality search', () => {
  it('finds an index whose value is the target', () => {
    const s = run(ARR, 'search', 3)
    expect(s.foundIdx).toBe(2)
    expect(ARR[s.foundIdx]).toBe(3)
    expect(s.ans).toBe(-1) // ans is inert in equality mode
  })

  it('returns foundIdx -1 on a miss', () => {
    const s = run(ARR, 'search', 4)
    expect(s.finished).toBe(true)
    expect(s.foundIdx).toBe(-1)
  })

  it('takes O(log n) steps', () => {
    const s = run(ARR, 'search', 8)
    expect(s.steps).toBeLessThanOrEqual(3)
    expect(ARR[s.foundIdx]).toBe(8)
  })
})

describe('lower_bound', () => {
  it('ans = index of first element >= x (== count of elements < x)', () => {
    // elements < 5 in [2,2,3,5,6,7,8] => {2,2,3} => count 3, first >=5 is index 3
    const s = run(ARR, 'lower', 5)
    expect(s.ans).toBe(3)
  })

  it('handles duplicates at the boundary', () => {
    // first element >= 2 is index 0
    const s = run(ARR, 'lower', 2)
    expect(s.ans).toBe(0)
  })

  it('ans defaults to n, and stays n when no element qualifies', () => {
    // initial ans is n (the not-found / count-when-all-smaller position)
    expect(initSearch(ARR, 'lower', 100).ans).toBe(ARR.length)
    // x larger than everything: no element >= x, so lower_bound = n = 7
    const s = run(ARR, 'lower', 100)
    expect(s.ans).toBe(ARR.length)
  })
})

describe('upper_bound', () => {
  it('ans = index of first element > x', () => {
    // first element > 5 is index 4 (value 6)
    const s = run(ARR, 'upper', 5)
    expect(s.ans).toBe(4)
  })

  it('skips a run of equal values', () => {
    // first element > 2 is index 2 (value 3)
    const s = run(ARR, 'upper', 2)
    expect(s.ans).toBe(2)
  })

  it('ans = n when nothing is greater than x', () => {
    // x >= max: no element > x, so upper_bound = n = 7 (0 elements greater)
    const s = run(ARR, 'upper', 8)
    expect(s.ans).toBe(ARR.length)
  })
})

describe('step mechanics', () => {
  it('is a no-op once finished', () => {
    const done = run(ARR, 'search', 3)
    expect(stepSearch(done)).toBe(done)
  })

  it('does not mutate the previous state (pure)', () => {
    const a = initSearch(ARR, 'search', 3)
    const b = stepSearch(a)
    expect(a.steps).toBe(0)
    expect(b.steps).toBe(1)
    expect(a.excluded).not.toBe(b.excluded)
  })
})

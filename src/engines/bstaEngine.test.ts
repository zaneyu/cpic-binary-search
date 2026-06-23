import { describe, it, expect } from 'vitest'
import {
  initBsta,
  stepBsta,
  buildCustomCheck,
  type BstaState,
  type ParsedParams,
} from './bstaEngine'

function run(p: ParsedParams): BstaState {
  let s = initBsta(p)
  let guard = 0
  while (!s.finished && guard++ < 100) s = stepBsta(p, s)
  return s
}

describe('log cutting (min)', () => {
  it('finds the smallest feasible max-piece length', () => {
    // [7,9,11], K=4 -> x=5 works (cuts=4), x=4 fails (cuts=5)
    const s = run({ kind: 'logs', lengths: [7, 9, 11], k: 4 })
    expect(s.ans).toBe(5)
  })
  it('reveals the good region as a suffix anchored at initialHi', () => {
    const s = run({ kind: 'logs', lengths: [7, 9, 11], k: 4 })
    expect(s.trueGoodHi).toBe(11) // initialHi = max(lengths)
    expect(s.trueGoodLo).not.toBeNull()
  })
})

describe('duck transport (min)', () => {
  it('finds the smallest feasible K', () => {
    // N=6, D=3 -> walk=3; x=3 gives 1+1+1=3<=3, x=2 gives 4>3
    const s = run({ kind: 'ducks', n: 6, d: 3 })
    expect(s.ans).toBe(3)
  })
  it('short-circuits to true when walk <= 0', () => {
    // D >= N -> no walking; every x feasible -> smallest is initialLo = 1
    const s = run({ kind: 'ducks', n: 3, d: 3 })
    expect(s.ans).toBe(1)
  })
})

describe('custom check', () => {
  it('min: smallest x with x*x >= 50 over [1,100] is 8', () => {
    const checkFn = buildCustomCheck('return x * x >= 50;')
    const s = run({ kind: 'custom', lo: 1, hi: 100, dir: 'min', checkFn })
    expect(s.ans).toBe(8)
  })
  it('max: largest x with x <= 10 over [1,100] is 10, shrinking right on good', () => {
    const checkFn = buildCustomCheck('return x <= 10;')
    const s = run({ kind: 'custom', lo: 1, hi: 100, dir: 'max', checkFn })
    expect(s.ans).toBe(10)
    expect(s.trueGoodLo).toBe(1) // max -> prefix anchored at initialLo
  })
  it('throws the boolean error on a non-boolean return', () => {
    const checkFn = buildCustomCheck('return x + 1;')
    expect(() => checkFn(5)).toThrow('check() must return a boolean (got number).')
  })
})

describe('step mechanics', () => {
  it('is a no-op once finished and pure', () => {
    const p: ParsedParams = { kind: 'logs', lengths: [7, 9, 11], k: 4 }
    const done = run(p)
    expect(stepBsta(p, done)).toBe(done)
    const a = initBsta(p)
    const b = stepBsta(p, a)
    expect(a.steps).toBe(0)
    expect(b.steps).toBe(1)
    expect(a.probed).not.toBe(b.probed)
  })
})

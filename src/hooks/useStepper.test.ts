import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useStepper } from './useStepper'

interface Counter {
  n: number
}

const opts = {
  init: () => ({ n: 0 }),
  step: (s: Counter) => ({ n: s.n + 1 }),
  isFinished: (s: Counter) => s.n >= 3,
}

describe('useStepper', () => {
  it('steps forward and tracks history/canBack', () => {
    const { result } = renderHook(() => useStepper(opts))
    expect(result.current.state.n).toBe(0)
    expect(result.current.canBack).toBe(false)

    act(() => result.current.step())
    expect(result.current.state.n).toBe(1)
    expect(result.current.canBack).toBe(true)
  })

  it('back() restores the previous state', () => {
    const { result } = renderHook(() => useStepper(opts))
    act(() => result.current.step())
    act(() => result.current.step())
    expect(result.current.state.n).toBe(2)
    act(() => result.current.back())
    expect(result.current.state.n).toBe(1)
    act(() => result.current.back())
    expect(result.current.state.n).toBe(0)
    expect(result.current.canBack).toBe(false)
  })

  it('reset() clears history and re-inits', () => {
    const { result } = renderHook(() => useStepper(opts))
    act(() => result.current.step())
    act(() => result.current.reset())
    expect(result.current.state.n).toBe(0)
    expect(result.current.canBack).toBe(false)
  })

  it('does not advance past the finished state', () => {
    const { result } = renderHook(() => useStepper(opts))
    for (let i = 0; i < 6; i++) act(() => result.current.step())
    expect(result.current.state.n).toBe(3)
  })

  it('play() auto-advances on an interval and stops at finish', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useStepper({ ...opts, delay: 100 }))
    act(() => result.current.play())
    expect(result.current.playing).toBe(true)
    expect(result.current.state.n).toBe(1) // immediate first step
    act(() => vi.advanceTimersByTime(350))
    expect(result.current.state.n).toBe(3)
    expect(result.current.playing).toBe(false)
    vi.useRealTimers()
  })
})

import { useCallback, useEffect, useRef, useState } from 'react'

export interface StepperApi<S> {
  state: S
  step: () => void
  back: () => void
  reset: () => void
  play: () => void
  pause: () => void
  playing: boolean
  canBack: boolean
}

export interface StepperOpts<S> {
  init: () => S
  step: (s: S) => S
  isFinished: (s: S) => boolean
  /** auto-play interval in ms (read when play() is called) */
  delay?: number
}

/**
 * Wraps a pure engine (init/step/isFinished) with a history stack for back(),
 * a reset(), and interval-based auto-play. Components consume `state` and render.
 */
export function useStepper<S>({ init, step, isFinished, delay = 1800 }: StepperOpts<S>): StepperApi<S> {
  const stepRef = useRef(step)
  stepRef.current = step
  const finRef = useRef(isFinished)
  finRef.current = isFinished
  const delayRef = useRef(delay)
  delayRef.current = delay

  const [state, setState] = useState<S>(init)
  const [history, setHistory] = useState<S[]>([])
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    setPlaying(false)
  }, [])

  const advance = useCallback(() => {
    setState((prev) => {
      if (finRef.current(prev)) return prev
      setHistory((h) => [...h, prev])
      return stepRef.current(prev)
    })
  }, [])

  const step_ = useCallback(() => {
    stopTimer()
    advance()
  }, [advance, stopTimer])

  const back = useCallback(() => {
    stopTimer()
    setHistory((h) => {
      if (h.length === 0) return h
      setState(h[h.length - 1])
      return h.slice(0, -1)
    })
  }, [stopTimer])

  const reset = useCallback(() => {
    stopTimer()
    setHistory([])
    setState(init())
  }, [init, stopTimer])

  const play = useCallback(() => {
    stopTimer()
    setHistory([])
    setState(init())
    setPlaying(true)
    advance()
    timer.current = setInterval(() => {
      setState((prev) => {
        if (finRef.current(prev)) {
          stopTimer()
          return prev
        }
        setHistory((h) => [...h, prev])
        return stepRef.current(prev)
      })
    }, delayRef.current)
  }, [advance, init, stopTimer])

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return {
    state,
    step: step_,
    back,
    reset,
    play,
    pause: stopTimer,
    playing,
    canBack: history.length > 0,
  }
}

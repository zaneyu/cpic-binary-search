import { AnimatePresence, motion } from 'motion/react'
import type { Mode } from '../../engines/searchEngine'
import { springs, useCalmMotion } from '../../lib/motion'

interface Props {
  arr: number[]
  mode: Mode
  l: number
  r: number
  mid: number
  ans: number
  finished: boolean
  foundIdx: number
  excluded: Set<number>
}

// Animated targets: discarded cells recede (the halving), the probe and the
// answer stand proud. Scale carries the drama; color carries the meaning.
type Target = {
  backgroundColor: string
  borderColor: string
  color: string
  opacity: number
  scale: number
  y: number
}

const NEUTRAL: Target = {
  backgroundColor: 'rgba(0,0,0,0)',
  borderColor: 'var(--border-strong)',
  color: 'var(--text)',
  opacity: 1,
  scale: 1,
  y: 0,
}

export function ArrayTrack({ arr, mode, l, r, mid, ans, finished, foundIdx, excluded }: Props) {
  const calm = useCalmMotion()
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-1 gap-y-3 py-5 font-mono">
      <span className="self-stretch pt-2.5 text-lg text-text-hint">[</span>
      {arr.map((v, i) => {
        const inRange = !finished && i >= l && i <= r
        const isMid = i === mid && !finished
        const isFinal = finished && i === foundIdx && foundIdx !== -1
        const isAnsSoFar = !finished && (mode === 'lower' || mode === 'upper') && i === ans
        const isExcluded = excluded.has(i) || (finished && foundIdx === -1 && mode === 'search')

        let t: Target = { ...NEUTRAL }
        if (isFinal)
          t = { ...NEUTRAL, backgroundColor: 'var(--fill-success)', borderColor: 'var(--success)', color: 'var(--success)', scale: 1.08 }
        else if (isMid)
          t = { ...NEUTRAL, backgroundColor: 'var(--fill-mid)', borderColor: 'var(--highlight)', color: 'var(--highlight)', scale: 1.06 }
        else if (inRange)
          t = { ...NEUTRAL, backgroundColor: 'var(--fill-range)', borderColor: 'var(--border-range)', color: 'var(--accent)' }
        // Discarded: recede into the background — clearly "out", but the value
        // stays legible so a learner can still read what was eliminated.
        else if (isExcluded) t = { ...NEUTRAL, opacity: 0.32, scale: 0.7, y: 2 }

        return (
          <div key={i} className="relative flex flex-col items-center">
            <div className="relative">
              {/* answer-found bloom: a one-shot radial pulse on resolution */}
              <AnimatePresence>
                {isFinal && !calm && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-2 rounded-[6px]"
                    style={{ background: 'radial-gradient(circle, var(--success) 0%, transparent 68%)' }}
                    initial={{ opacity: 0.55, scale: 0.55 }}
                    animate={{ opacity: 0, scale: 1.9 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                className="relative flex h-[46px] min-w-[40px] items-center justify-center rounded-[2px] border px-2 text-sm font-medium tabular-nums"
                animate={t}
                transition={calm ? { duration: 0 } : springs.snappy}
              >
                {v}
              </motion.div>
            </div>
            <span className="mt-1 text-[10px] text-text-hint">{i}</span>
            {isAnsSoFar && !isMid && !isFinal && (
              <span className="absolute -top-4 text-[10px] text-primary">ans</span>
            )}
            {isMid && <span className="absolute -bottom-3.5 text-[11px] leading-none text-highlight">▲</span>}
          </div>
        )
      })}
      <span className="self-stretch pt-2.5 text-lg text-text-hint">]</span>
    </div>
  )
}

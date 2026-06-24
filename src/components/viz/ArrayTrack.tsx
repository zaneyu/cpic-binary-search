import { motion } from 'motion/react'
import type { Mode } from '../../engines/searchEngine'
import { springs } from '../../lib/motion'

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

type Target = { backgroundColor: string; borderColor: string; color: string; opacity: number }

const NEUTRAL: Target = {
  backgroundColor: 'rgba(0,0,0,0)',
  borderColor: 'var(--border-strong)',
  color: 'var(--text)',
  opacity: 1,
}

export function ArrayTrack({ arr, mode, l, r, mid, ans, finished, foundIdx, excluded }: Props) {
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
          t = { backgroundColor: 'var(--fill-success)', borderColor: 'var(--success)', color: 'var(--success)', opacity: 1 }
        else if (isMid)
          t = { backgroundColor: 'var(--fill-mid)', borderColor: 'var(--highlight)', color: 'var(--highlight)', opacity: 1 }
        else if (inRange)
          t = { backgroundColor: 'var(--fill-range)', borderColor: 'var(--border-range)', color: 'var(--accent)', opacity: 1 }
        else if (isExcluded) t = { ...NEUTRAL, opacity: 0.28 }

        return (
          <div key={i} className="relative flex flex-col items-center">
            <motion.div
              className="flex h-[46px] min-w-[40px] items-center justify-center rounded-[2px] border px-2 text-sm font-medium tabular-nums"
              animate={t}
              transition={springs.snappy}
            >
              {v}
            </motion.div>
            <span className="mt-1 text-[10px] text-text-hint">{i}</span>
            {isAnsSoFar && !isMid && !isFinal && (
              <span className="absolute -top-4 text-[10px] text-accent">ans</span>
            )}
            {isMid && <span className="absolute -bottom-3.5 text-[11px] leading-none text-highlight">▲</span>}
          </div>
        )
      })}
      <span className="self-stretch pt-2.5 text-lg text-text-hint">]</span>
    </div>
  )
}

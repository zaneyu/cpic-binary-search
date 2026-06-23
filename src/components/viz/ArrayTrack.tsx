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

type Target = {
  backgroundColor: string
  borderColor: string
  color: string
  scale: number
  opacity: number
  boxShadow: string
}

const NEUTRAL: Target = {
  backgroundColor: 'rgba(140,160,200,0.04)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
  scale: 1,
  opacity: 1,
  boxShadow: '0 0 0 rgba(0,0,0,0)',
}

export function ArrayTrack({ arr, mode, l, r, mid, ans, finished, foundIdx, excluded }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 py-5">
      {arr.map((v, i) => {
        const inRange = !finished && i >= l && i <= r
        const isMid = i === mid && !finished
        const isFinal = finished && i === foundIdx && foundIdx !== -1
        const isAnsSoFar = !finished && (mode === 'lower' || mode === 'upper') && i === ans
        const isExcluded = excluded.has(i) || (finished && foundIdx === -1 && mode === 'search')

        let t: Target = { ...NEUTRAL }
        if (isFinal) {
          t = {
            backgroundColor: 'rgba(109,195,149,0.18)',
            borderColor: 'rgba(109,195,149,0.6)',
            color: 'var(--success)',
            scale: 1.07,
            opacity: 1,
            boxShadow: '0 0 24px rgba(109,195,149,0.5)',
          }
        } else if (isMid) {
          t = {
            backgroundColor: 'rgba(240,198,116,0.18)',
            borderColor: 'rgba(240,198,116,0.6)',
            color: 'var(--highlight)',
            scale: 1.07,
            opacity: 1,
            boxShadow: '0 0 22px rgba(240,198,116,0.42)',
          }
        } else if (inRange) {
          t = {
            backgroundColor: 'rgba(95,184,212,0.12)',
            borderColor: 'rgba(95,184,212,0.4)',
            color: 'var(--accent)',
            scale: 1,
            opacity: 1,
            boxShadow: '0 0 0 rgba(0,0,0,0)',
          }
        } else if (isExcluded) {
          t = { ...NEUTRAL, opacity: 0.3, scale: 0.96 }
        }

        return (
          <motion.div
            key={i}
            className="relative flex h-[52px] min-w-[40px] flex-col items-center justify-center rounded-md border px-1.5 text-sm font-medium"
            animate={t}
            transition={springs.gentle}
          >
            {isAnsSoFar && !isMid && !isFinal && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-[3px] bg-bg px-1.5 text-[10px] font-medium text-accent">
                ans
              </span>
            )}
            <span>{v}</span>
            <span className="mt-0.5 text-[10px] font-normal opacity-55">{i}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

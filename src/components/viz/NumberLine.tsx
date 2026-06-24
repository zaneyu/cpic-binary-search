import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { springs, useCalmMotion } from '../../lib/motion'

interface Props {
  lo: number
  hi: number
  l: number
  r: number
  mid: number
  ans: number
  finished: boolean
  trueGoodLo: number | null
  trueGoodHi: number | null
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(700)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

export function NumberLine({ lo, hi, l, r, mid, ans, finished, trueGoodLo, trueGoodHi }: Props) {
  const [ref, w] = useWidth()
  const calm = useCalmMotion()
  const span = hi - lo
  const x = (v: number) => (span <= 0 ? w / 2 : ((v - lo) / span) * w)
  const t = calm ? { duration: 0 } : springs.gentle

  const tickCount = Math.min(11, span + 1)
  const ticks = Array.from({ length: Math.max(tickCount, 2) }, (_, i) =>
    Math.round(lo + (span * i) / (Math.max(tickCount, 2) - 1)),
  )

  return (
    <div className="cpic-scroll overflow-hidden px-1 pb-2 pt-3">

      <div ref={ref} className="relative h-[116px] min-w-full">
        {/* track */}
        <div className="absolute left-0 right-0 top-[60px] h-1 rounded bg-surface-muted" />

        {/* good region (direction-aware) */}
        {trueGoodLo !== null && trueGoodHi !== null && (
          <motion.div
            className="absolute top-[55px] h-[14px] rounded-sm bg-success/12 ring-1 ring-success/40"
            style={{ width: Math.max(2, x(trueGoodHi) - x(trueGoodLo)) }}
            animate={{ x: x(trueGoodLo) }}
            transition={t}
          />
        )}

        {/* active [l, r] window */}
        {!finished && l <= r && (
          <>
            <motion.div
              className="absolute top-[60px] h-1 bg-accent"
              style={{ width: Math.max(2, x(r) - x(l)) }}
              animate={{ x: x(l) }}
              transition={t}
            />
            <motion.div
              className="absolute top-[28px] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-accent tabular-nums"
              animate={{ x: x(l) }}
              transition={t}
            >
              l={l}
            </motion.div>
            <motion.div
              className="absolute top-[84px] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-accent tabular-nums"
              animate={{ x: x(r) }}
              transition={t}
            >
              r={r}
            </motion.div>
          </>
        )}

        {/* mid marker */}
        {mid !== -1 && !finished && (
          <>
            <motion.div
              className="absolute top-[48px] h-7 w-0.5 bg-highlight"
              animate={{ x: x(mid) }}
              transition={t}
            />
            <motion.div
              className="absolute top-[6px] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-highlight tabular-nums"
              animate={{ x: x(mid) }}
              transition={t}
            >
              mid={mid}
            </motion.div>
          </>
        )}

        {/* ans marker */}
        {ans !== -1 && (
          <>
            <motion.div
              className="absolute top-[48px] h-7 w-0.5 bg-success"
              animate={{ x: x(ans) }}
              transition={t}
            />
            <motion.div
              className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-success tabular-nums"
              style={{ top: finished ? 6 : 96 }}
              animate={{ x: x(ans) }}
              transition={t}
            >
              {finished ? '✓ ans=' : 'ans='}
              {ans}
            </motion.div>
          </>
        )}

        {/* ticks */}
        {ticks.map((v, i) => (
          <div key={i}>
            <div className="absolute top-[66px] h-[5px] w-px -translate-x-1/2 bg-text-hint/40" style={{ left: x(v) }} />
            <div
              className="absolute top-[75px] -translate-x-1/2 text-[10px] text-text-hint tabular-nums"
              style={{ left: x(v) }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
  // Inset the scale so the centered end labels (l=, r=, mid=, ticks) never clip at the edges.
  const PAD = 18
  const x = (v: number) => {
    if (span <= 0) return w / 2
    const inner = Math.max(1, w - PAD * 2)
    return PAD + ((v - lo) / span) * inner
  }
  const t = calm ? { duration: 0 } : springs.gentle

  const tickCount = Math.min(11, span + 1)
  const ticks = Array.from({ length: Math.max(tickCount, 2) }, (_, i) =>
    Math.round(lo + (span * i) / (Math.max(tickCount, 2) - 1)),
  )

  // The monotonic cutoff: the edge of the good region that borders the false
  // region (the interior edge, not the one pinned to the domain boundary).
  const cutoff =
    trueGoodLo !== null && trueGoodHi !== null ? (trueGoodLo > lo ? trueGoodLo : trueGoodHi) : null

  return (
    <div className="cpic-scroll overflow-hidden px-1 pb-2 pt-3">

      <div ref={ref} className="relative h-[116px] min-w-full">
        {/* track */}
        <div className="absolute top-[60px] h-1 rounded bg-surface-muted" style={{ left: 18, right: 18 }} />

        {/* good region (direction-aware) — soft success halo */}
        {trueGoodLo !== null && trueGoodHi !== null && (
          <motion.div
            className="absolute top-[55px] h-[14px] rounded-sm bg-success/12 ring-1 ring-success/40"
            style={{ width: Math.max(2, x(trueGoodHi) - x(trueGoodLo)), boxShadow: '0 0 18px -6px var(--success)' }}
            animate={{ x: x(trueGoodLo) }}
            transition={t}
          />
        )}

        {/* monotonic cutoff: a glowing threshold where false flips to true */}
        {cutoff !== null && (
          <motion.div
            aria-hidden
            className="absolute top-[51px] h-[22px] w-px -translate-x-1/2 bg-success"
            style={{ boxShadow: '0 0 9px 1px var(--success)' }}
            animate={{ x: x(cutoff), opacity: finished || calm ? 1 : [0.5, 1, 0.5] }}
            transition={{
              x: t,
              opacity: finished || calm ? { duration: 0 } : { duration: 1.9, repeat: Infinity, ease: 'easeInOut' },
            }}
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

        {/* answer-found bloom: one-shot radial pulse on resolution */}
        <AnimatePresence>
          {finished && ans !== -1 && !calm && (
            <motion.div
              key="ans-bloom"
              aria-hidden
              className="pointer-events-none absolute top-[39px] h-12 w-12 -translate-x-1/2 rounded-full"
              style={{ left: x(ans), background: 'radial-gradient(circle, var(--success) 0%, transparent 68%)' }}
              initial={{ opacity: 0.5, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

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

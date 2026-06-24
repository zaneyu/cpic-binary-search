import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs, useCalmMotion } from '../../lib/motion'

const MAX_COLS = 200

interface Props {
  lo: number
  hi: number
  probed: Map<number, boolean>
  showAll: boolean
  check: (x: number) => boolean
}

export function MonotonicityCurve({ lo, hi, probed, showAll, check }: Props) {
  const calm = useCalmMotion()
  const span = hi - lo
  if (span < 0) return <div className="h-14" />
  const stride = span + 1 > MAX_COLS ? Math.ceil((span + 1) / MAX_COLS) : 1
  const numCols = Math.ceil((span + 1) / stride)
  const colW = 100 / numCols

  const cols: { x: number; result: boolean | null; isProbed: boolean }[] = []
  for (let i = 0; i < numCols; i++) {
    const x = lo + i * stride
    if (x > hi) break
    const isProbed = probed.has(x)
    let result: boolean | null = null
    if (isProbed) result = probed.get(x)!
    else if (showAll) {
      try {
        result = check(x)
      } catch {
        result = null
      }
    }
    cols.push({ x, result, isProbed })
  }
  const annotate = showAll || probed.size > 0

  // The flip: the one place a known false neighbours a known true (monotonic).
  let boundaryAfter = -1
  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i].result
    const b = cols[i + 1].result
    if (a !== null && b !== null && a !== b) {
      boundaryAfter = i
      break
    }
  }

  return (
    <div className="relative mb-3.5 h-14 overflow-hidden border-b border-line">
      {annotate && (
        <>
          <span className="pointer-events-none absolute left-1.5 top-4 z-10 text-[10px] font-semibold uppercase tracking-wider text-success">
            true
          </span>
          <span className="pointer-events-none absolute bottom-1 left-1.5 z-10 text-[10px] font-semibold uppercase tracking-wider text-danger">
            false
          </span>
        </>
      )}
      {cols.map(({ x, result, isProbed }, i) => {
        const h = result === true ? 38 : result === false ? 18 : 14
        const cls =
          result === true
            ? 'bg-success/35 border-t-[1.5px] border-success'
            : result === false
              ? 'bg-danger/30 border-t-[1.5px] border-danger'
              : 'bg-surface-muted border-t border-dashed border-line-strong'
        const label =
          result === true
            ? `check(${x}) = true${isProbed ? ' · probed' : ''}`
            : result === false
              ? `check(${x}) = false${isProbed ? ' · probed' : ''}`
              : `check(${x}) — not yet tested`
        return (
          <motion.div
            key={x}
            title={label}
            aria-label={label}
            className={cn('absolute bottom-0 origin-bottom', cls, isProbed && 'ring-[1.5px] ring-inset ring-highlight')}
            style={{
              left: `${i * colW}%`,
              width: `${colW}%`,
              height: h,
              // light up the true region so the monotone half glows
              ...(result === true ? { boxShadow: '0 -7px 15px -7px var(--success)' } : null),
            }}
            initial={{ scaleY: 0.3, opacity: 0 }}
            animate={{ scaleY: 1, opacity: result === null && !showAll ? 0.55 : 1 }}
            transition={springs.gentle}
          />
        )
      })}

      {/* glowing threshold at the false→true flip */}
      {annotate && boundaryAfter >= 0 && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-success"
          style={{ left: `${(boundaryAfter + 1) * colW}%`, boxShadow: '0 0 9px 1px var(--success)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: calm ? 0.9 : [0.4, 1, 0.4] }}
          transition={calm ? { duration: 0 } : { duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

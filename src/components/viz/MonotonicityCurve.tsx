import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs } from '../../lib/motion'

const MAX_COLS = 200

interface Props {
  lo: number
  hi: number
  probed: Map<number, boolean>
  showAll: boolean
  check: (x: number) => boolean
}

export function MonotonicityCurve({ lo, hi, probed, showAll, check }: Props) {
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
        return (
          <motion.div
            key={x}
            className={cn('absolute bottom-0 origin-bottom', cls, isProbed && 'ring-[1.5px] ring-inset ring-highlight')}
            style={{ left: `${i * colW}%`, width: `${colW}%`, height: h }}
            initial={{ scaleY: 0.3, opacity: 0 }}
            animate={{ scaleY: 1, opacity: result === null && !showAll ? 0.55 : 1 }}
            transition={springs.gentle}
          />
        )
      })}
    </div>
  )
}

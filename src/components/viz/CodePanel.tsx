import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs, useCalmMotion } from '../../lib/motion'

/** C++ pseudocode with an active line that glides as the search runs. */
export function CodePanel({
  lines,
  activeLine,
  id,
  className,
}: {
  lines: string[]
  activeLine: number | null
  id: string
  className?: string
}) {
  const calm = useCalmMotion()
  return (
    <pre
      className={cn(
        'cpic-scroll overflow-x-auto rounded-md border border-line bg-bg px-3 py-3 font-mono text-xs leading-[1.65] text-text-muted',
        className,
      )}
    >
      {lines.map((line, i) => {
        const active = i === activeLine
        return (
          <div key={i} className="relative px-1">
            {active && (
              <motion.div
                layoutId={`code-hl-${id}`}
                transition={calm ? { duration: 0 } : springs.snappy}
                className="absolute inset-0 rounded-[3px] bg-highlight/15 ring-1 ring-highlight/30"
              />
            )}
            <span className={cn('relative whitespace-pre', active && 'text-highlight')}>
              {line || ' '}
            </span>
          </div>
        )
      })}
    </pre>
  )
}

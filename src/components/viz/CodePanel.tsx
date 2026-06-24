import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useCalmMotion } from '../../lib/motion'
import { highlight } from '../../lib/highlight'

/** C++ pseudocode with a line-number gutter and an editor-style active line. */
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
    <div
      className={cn(
        'cpic-scroll cpic-xscroll overflow-x-auto rounded-[3px] border border-line-strong py-1.5 font-mono text-xs leading-[1.7]',
        className,
      )}
    >
      {lines.map((line, i) => {
        const active = i === activeLine
        return (
          <div key={i} className="relative flex">
            {active && (
              <motion.div
                layoutId={`code-hl-${id}`}
                transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 44 }}
                className="absolute inset-y-0 left-0 right-0 border-l-2 border-primary bg-primary/8"
              />
            )}
            <span className="relative w-9 shrink-0 select-none pr-2.5 text-right text-text-hint">
              {i + 1}
            </span>
            <span className="relative whitespace-pre pr-4 text-text">{highlight(line)}</span>
          </div>
        )
      })}
    </div>
  )
}

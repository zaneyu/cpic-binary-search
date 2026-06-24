import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

export type ChipTone = 'default' | 'idx' | 'mid' | 'count' | 'ans' | 'true' | 'false'
export interface Chip {
  label: string
  value: string | number
  tone?: ChipTone
}

const toneValue: Record<ChipTone, string> = {
  default: 'text-text',
  idx: 'text-primary',
  mid: 'text-highlight',
  count: 'text-success',
  ans: 'text-accent-2',
  true: 'text-success',
  false: 'text-danger',
}
const toneLabel: Record<ChipTone, string> = {
  default: 'text-text-hint',
  idx: 'text-primary/70',
  mid: 'text-highlight/70',
  count: 'text-success/70',
  ans: 'text-accent-2/70',
  true: 'text-success/70',
  false: 'text-danger/70',
}

export function StatChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-line bg-line max-sm:[&>:last-child]:col-span-2 sm:grid-cols-5">
      {chips.map((c) => {
        const tone = c.tone ?? 'default'
        return (
          <div key={c.label} className="flex items-baseline justify-between gap-2 bg-surface px-3 py-2.5">
            <span className={cn('font-mono text-[11px]', toneLabel[tone])}>{c.label}</span>
            <motion.span
              key={String(c.value)}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
              className={cn('font-mono text-[15px] font-medium tabular-nums', toneValue[tone])}
            >
              {c.value}
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}

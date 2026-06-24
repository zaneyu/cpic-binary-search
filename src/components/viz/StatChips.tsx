import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

export type ChipTone = 'default' | 'ans' | 'true' | 'false'
export interface Chip {
  label: string
  value: string | number
  tone?: ChipTone
}

const toneText: Record<ChipTone, string> = {
  default: 'text-text',
  ans: 'text-accent-2',
  true: 'text-success',
  false: 'text-danger',
}
const toneBorder: Record<ChipTone, string> = {
  default: 'border-line',
  ans: 'border-accent-2/40',
  true: 'border-success/50',
  false: 'border-danger/50',
}

export function StatChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-3 md:grid-cols-5">
      {chips.map((c) => (
        <div key={c.label} className={cn('flex items-baseline justify-between gap-2 bg-surface px-3 py-2.5', toneBorder[c.tone ?? 'default'])}>
          <span className="font-mono text-[11px] text-text-hint">{c.label}</span>
          <motion.span
            key={String(c.value)}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className={cn('font-mono text-[15px] font-medium tabular-nums', toneText[c.tone ?? 'default'])}
          >
            {c.value}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

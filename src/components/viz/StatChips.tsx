import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs } from '../../lib/motion'

export type ChipTone = 'default' | 'ans' | 'true' | 'false'
export interface Chip {
  label: string
  value: string | number
  tone?: ChipTone
}

const toneRing: Record<ChipTone, string> = {
  default: 'border-line',
  ans: 'border-accent-2/45 bg-[linear-gradient(180deg,rgba(184,137,232,0.08),transparent)]',
  true: 'border-success/50',
  false: 'border-danger/50',
}
const toneText: Record<ChipTone, string> = {
  default: 'text-text',
  ans: 'text-accent-2',
  true: 'text-success',
  false: 'text-danger',
}

export function StatChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
      {chips.map((c) => (
        <div
          key={c.label}
          className={cn('rounded-md border bg-surface px-3 py-2.5', toneRing[c.tone ?? 'default'])}
        >
          <div className={cn('mb-1 text-[11px]', c.tone === 'ans' ? 'text-accent-2' : 'text-text-muted')}>
            {c.label}
          </div>
          <div className="overflow-hidden">
            <motion.div
              key={String(c.value)}
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={springs.snappy}
              className={cn('text-lg font-medium tabular-nums leading-tight', toneText[c.tone ?? 'default'])}
            >
              {c.value}
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  )
}

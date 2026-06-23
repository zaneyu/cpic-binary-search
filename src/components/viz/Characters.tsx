import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs } from '../../lib/motion'
import type { BobBubble } from '../../engines/bobEngine'

function Bubble({ who, bubble }: { who: 'you' | 'bob'; bubble: BobBubble | { text: string; kind: 'normal' } | null }) {
  const kind = bubble && 'kind' in bubble ? bubble.kind : 'normal'
  const tone =
    who === 'you'
      ? 'bg-accent/15 border-accent/50 text-accent'
      : kind === 'found'
        ? 'bg-success/20 border-success/60 text-success text-[18px]'
        : kind === 'invalid'
          ? 'bg-danger/15 border-danger/50 text-danger text-sm'
          : 'bg-highlight/15 border-highlight/50 text-highlight'
  return (
    <AnimatePresence>
      {bubble && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={springs.snappy}
          className={cn(
            'absolute top-1 z-10 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-base font-semibold',
            who === 'you' ? 'right-[-6px] sm:right-[-20px]' : 'left-[-6px] sm:left-[-20px]',
            tone,
          )}
        >
          {bubble.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Face({ face }: { face: string }) {
  return (
    <motion.div
      key={face}
      initial={{ scale: 0.8 }}
      animate={{ scale: [1, 1.18, 1] }}
      transition={springs.gentle}
      className="inline-block text-[56px] leading-none sm:text-[72px]"
    >
      {face}
    </motion.div>
  )
}

export function Characters({
  youFace,
  bobFace,
  bubbleYou,
  bubbleBob,
}: {
  youFace: string
  bobFace: string
  bubbleYou: string | null
  bubbleBob: BobBubble | null
}) {
  return (
    <div className="mb-4 flex min-h-[140px] items-end justify-between px-0.5 sm:justify-around sm:px-8">
      <div className="relative w-[104px] text-center sm:w-[200px]">
        <Face face={youFace} />
        <div className="mt-1.5 text-xs font-medium tracking-wider text-text-muted">YOU</div>
        <Bubble who="you" bubble={bubbleYou ? { text: bubbleYou, kind: 'normal' } : null} />
      </div>
      <div className="relative w-[104px] text-center sm:w-[200px]">
        <Face face={bobFace} />
        <div className="mt-1.5 text-xs font-medium tracking-wider text-text-muted">BOB</div>
        <Bubble who="bob" bubble={bubbleBob} />
      </div>
    </div>
  )
}

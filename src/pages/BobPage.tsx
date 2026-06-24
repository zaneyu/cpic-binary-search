import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { guess, newGame, rangeSize, type BobState } from '../engines/bobEngine'
import { cn } from '../lib/cn'
import { springs, useCalmMotion } from '../lib/motion'
import { RichText } from '../lib/math'
import { Button, TextInput } from '../components/ui/controls'
import { Characters } from '../components/viz/Characters'

// Token names (not literals) so confetti follows the active theme.
const CONFETTI = ['--accent', '--accent-2', '--accent-3', '--highlight', '--success']

function Confetti() {
  const calm = useCalmMotion()
  if (calm) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2
        const dist = 120 + (i % 5) * 26
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-[2px]"
            style={{ background: `var(${CONFETTI[i % CONFETTI.length]})` }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 40,
              opacity: 0,
              scale: 0.4,
              rotate: (i % 2 ? 1 : -1) * 220,
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

function RangeLine({ state }: { state: BobState }) {
  const calm = useCalmMotion()
  const t = calm ? { duration: 0 } : springs.gentle
  return (
    <div className="my-3">
      <div
        className={cn('mb-1.5 text-center font-mono text-xs', state.rangeWon ? 'text-success' : 'text-text-muted')}
      >
        {state.rangeWon ? `Bob's score = ${state.target}` : state.rangeLabel}
      </div>
      <div className="relative mx-auto h-9 max-w-[720px]">
        <div className="absolute inset-x-0 top-3.5 h-1 rounded bg-surface-muted" />
        <motion.div
          className={cn('absolute top-3 h-2 rounded-[2px]', state.rangeWon ? 'bg-success' : 'bg-primary')}
          animate={{
            left: `${state.rangeWon ? state.target : state.lo}%`,
            width: `${state.rangeWon ? 0.6 : Math.max(0.5, state.hi - state.lo)}%`,
          }}
          transition={t}
        />
        <AnimatePresence>
          {state.marks.map((m) => (
            <motion.div
              key={`${m.value}-${m.latest}`}
              className={cn(
                'absolute -translate-x-1/2 rounded',
                m.latest ? 'top-[5px] h-[22px] w-[3px] bg-highlight' : 'top-2 h-4 w-0.5 bg-highlight/50',
              )}
              style={{ left: `${m.value}%` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: m.latest ? 1 : 0.7 }}
              transition={springs.snappy}
            />
          ))}
        </AnimatePresence>
        {[0, 25, 50, 75, 100].map((v) => (
          <div
            key={v}
            className="absolute top-6 -translate-x-1/2 font-mono text-[10px] text-text-hint"
            style={{ left: `${v}%` }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BobPage() {
  const [state, setState] = useState<BobState>(() => newGame({ first: true }))
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function makeGuess() {
    setState((s) => guess(s, input))
    setInput('')
    inputRef.current?.focus()
  }
  function reset() {
    setState(newGame())
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-mono text-xl font-semibold tracking-tight text-accent-3">
          guess bob's score
        </h1>
        <RichText
          className="prose-sans mt-1 text-sm text-text-muted"
          html={'Bob is thinking of a whole number $s$ between $0$ and $100$. Guess it in as few tries as you can!'}
        />
      </header>

      <h2 className="sr-only">Play</h2>
      <div className="relative overflow-hidden rounded-[3px] border border-line-strong bg-surface p-6">
        {state.gameOver && <Confetti />}
        <Characters
          youFace={state.youFace}
          bobFace={state.bobFace}
          bubbleYou={state.bubbleYou}
          bubbleBob={state.bubbleBob}
        />

        <RangeLine state={state} />

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
          <label className="text-[13px] text-text-muted" htmlFor="guess">
            Your guess:
          </label>
          <TextInput
            id="guess"
            ref={inputRef}
            type="number"
            min={0}
            max={100}
            placeholder="0–100"
            value={input}
            disabled={state.gameOver}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
            className="w-24 text-center text-base font-semibold text-primary"
          />
          <Button variant="primary" onClick={makeGuess} disabled={state.gameOver}>
            Guess
          </Button>
          <Button onClick={reset}>New game</Button>
        </div>

        <div className="flex flex-wrap justify-center gap-3.5 text-[13px]">
          <div className="rounded-[3px] border border-line bg-surface-muted px-3.5 py-1.5 text-text-muted">
            Guesses: <strong className="ml-1 text-text tabular-nums">{state.guessCount}</strong>
          </div>
          <div className="rounded-[3px] border border-line bg-surface-muted px-3.5 py-1.5 text-text-muted">
            Optimal max: <strong className="ml-1 text-text">7</strong>
          </div>
          <div
            className={cn(
              'rounded-[3px] border px-3.5 py-1.5',
              state.rangeWon ? 'border-success/40 bg-success/15 text-success' : 'border-line bg-surface-muted text-text-muted',
            )}
          >
            {state.rangeWon ? 'You won in: ' : 'Range size: '}
            <strong className={cn('ml-1 tabular-nums', state.rangeWon ? 'text-success' : 'text-text')}>
              {state.rangeWon
                ? `${state.guessCount} guess${state.guessCount === 1 ? '' : 'es'}`
                : rangeSize(state)}
            </strong>
          </div>
        </div>

        <AnimatePresence>
          {state.hintHtml && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <RichText
                html={state.hintHtml}
                className="prose-sans rounded-[3px] border border-line-strong bg-surface-muted px-4 py-3 text-center text-sm leading-relaxed text-text-muted [&_code]:rounded-[2px] [&_code]:bg-surface [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-primary"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

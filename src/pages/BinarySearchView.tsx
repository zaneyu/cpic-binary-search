import { useEffect, useRef, useState } from 'react'
import { initSearch, isFinished, stepSearch, type Mode, type SearchState } from '../engines/searchEngine'
import { useStepper } from '../hooks/useStepper'
import { RichText } from '../lib/math'
import {
  CODE_TEMPLATES,
  DEFAULT_ARRAY,
  DEFAULT_TARGET,
  MODE_DESCS,
  MODE_LABELS,
  STL_TEMPLATES,
  parseArray,
  randomArray,
} from '../data/searchContent'
import { Button, Segmented, SpeedSlider, TextInput } from '../components/ui/controls'
import { IconNext, IconPlay, IconPrev, IconReset } from '../components/ui/icons'
import { highlight } from '../lib/highlight'
import { ArrayTrack } from '../components/viz/ArrayTrack'
import { Legend } from '../components/viz/Legend'
import { CodePanel } from '../components/viz/CodePanel'
import { StatChips, type Chip } from '../components/viz/StatChips'
import { StatusBar } from '../components/viz/StatusBar'

const DEFAULT_HINT = 'Comma-separated numbers. Auto-sorted on load. Duplicates allowed. Max 40 elements.'

export function BinarySearchView({ active }: { active: boolean }) {
  const [arr, setArr] = useState<number[]>(DEFAULT_ARRAY)
  const [mode, setMode] = useState<Mode>('search')
  const [arrInput, setArrInput] = useState(DEFAULT_ARRAY.join(', '))
  const [targetStr, setTargetStr] = useState(String(DEFAULT_TARGET))
  const [hint, setHint] = useState(DEFAULT_HINT)
  const [hintWarn, setHintWarn] = useState(false)
  const [delay, setDelay] = useState(1800)

  const target = targetStr.trim() === '' ? 0 : Number(targetStr)
  const stepper = useStepper<SearchState>({
    init: () => initSearch(arr, mode, Number.isNaN(target) ? 0 : target),
    step: stepSearch,
    isFinished,
    delay,
  })
  const s = stepper.state

  const resetRef = useRef(stepper.reset)
  resetRef.current = stepper.reset
  const stepRef = useRef(stepper.step)
  stepRef.current = stepper.step
  const backRef = useRef(stepper.back)
  backRef.current = stepper.back

  // Reset whenever the inputs that define the run change.
  useEffect(() => {
    resetRef.current()
  }, [arr, mode, targetStr])

  // Route/tab-scoped keyboard, ignoring text fields and modifiers.
  useEffect(() => {
    if (!active) return
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase()
      // Don't hijack keys from focused controls — let buttons/tabs/switch handle their own.
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        stepRef.current()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        backRef.current()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        resetRef.current()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [active])

  function loadArray() {
    const res = parseArray(arrInput)
    if (res.error) {
      setHint(res.error)
      setHintWarn(true)
      return
    }
    const sorted = [...res.nums!].sort((a, b) => a - b)
    const wasUnsorted = sorted.some((v, i) => v !== res.nums![i])
    setArr(sorted)
    setArrInput(sorted.join(', '))
    setHint(wasUnsorted ? `Array was auto-sorted. ${sorted.length} elements loaded.` : `${sorted.length} elements loaded.`)
    setHintWarn(false)
  }
  function loadRandom() {
    const next = randomArray()
    setArr(next)
    setArrInput(next.join(', '))
    setHint(`${next.length} random elements loaded (with possible duplicates).`)
    setHintWarn(false)
  }

  const chips: Chip[] = [
    { label: 'l', value: s.l > s.r ? '—' : s.l, tone: 'idx' },
    { label: 'mid', value: s.mid === -1 ? '—' : s.mid, tone: 'mid' },
    { label: 'r', value: s.l > s.r ? '—' : s.r, tone: 'idx' },
    { label: 'ans', value: s.ans === -1 ? '-1' : s.ans, tone: 'ans' },
    { label: 'steps', value: s.steps, tone: 'count' },
  ]

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-mono text-xl font-semibold tracking-tight text-accent">
          binary search
        </h1>
        <RichText
          className="prose-sans mt-1 max-w-[68ch] text-sm leading-relaxed text-text-muted"
          html={
            'Three ways to search a sorted list. Each takes only $O(\\log n)$ steps — far faster than checking elements one by one ($O(n)$). We keep two markers $l$ and $r$ for the part still to check, and loop while $l \\le r$. The highlighted line is the one running right now.'
          }
        />
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="array-input" className="text-sm text-text-muted">
          Array
        </label>
        <TextInput
          id="array-input"
          className="min-w-[200px] flex-1"
          value={arrInput}
          onChange={(e) => setArrInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadArray()}
          aria-describedby="array-hint"
        />
        <Button onClick={loadArray}>Load</Button>
        <Button variant="subtle" onClick={loadRandom}>
          Random
        </Button>
      </div>
      <p
        id="array-hint"
        role={hintWarn ? 'alert' : undefined}
        className={hintWarn ? 'text-xs text-danger' : 'text-xs text-text-hint'}
      >
        {hint}
      </p>

      <section aria-labelledby="search-mode-heading" className="rounded-[3px] border border-line-strong bg-surface p-4">
        <h2 id="search-mode-heading" className="sr-only">
          Search mode and code
        </h2>
        <Segmented<Mode>
          groupId="search-mode"
          ariaLabel="Search mode"
          value={mode}
          onChange={setMode}
          options={(['search', 'lower', 'upper'] as Mode[]).map((m) => ({ value: m, label: MODE_LABELS[m] }))}
        />
        <RichText
          className="prose-sans mt-2.5 max-w-[68ch] text-sm leading-relaxed text-text-muted [&_code]:rounded-[2px] [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent"
          html={MODE_DESCS[mode]}
        />
        <div className="mt-3">
          <CodePanel id="search" lines={CODE_TEMPLATES[mode]} activeLine={s.activeLine} />
        </div>
        {STL_TEMPLATES[mode] && (
          <div className="mt-3">
            <div className="prose-sans mb-1.5 text-xs text-text-muted">Or skip the loop — C++ already has this built in:</div>
            <pre className="cpic-scroll cpic-xscroll overflow-x-auto rounded-[3px] border border-line-strong px-3 py-3 font-mono text-xs leading-[1.6] text-text">
              {STL_TEMPLATES[mode]!.split('\n').map((ln, i) => (
                <div key={i}>{highlight(ln)}</div>
              ))}
            </pre>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2.5">
        <label htmlFor="target-input" className="text-sm text-text-muted">
          Target
        </label>
        <TextInput
          id="target-input"
          type="number"
          className="w-20 text-center"
          value={targetStr}
          onChange={(e) => setTargetStr(e.target.value)}
        />
        <Button variant="primary" onClick={stepper.play} title="Auto-play">
          <IconPlay /> Start
        </Button>
        <Button onClick={stepper.back} disabled={!stepper.canBack} title="Back (← key)">
          <IconPrev /> Back
        </Button>
        <Button onClick={stepper.step} title="Step (→ or Space)">
          <IconNext /> Step
        </Button>
        <Button onClick={stepper.reset} title="Reset (R key)">
          <IconReset /> Reset
        </Button>
        <SpeedSlider value={4000 - delay} onChange={setDelay} />
      </div>
      <p className="font-mono text-[11px] text-text-hint">
        <span className="text-text-muted">→</span> / space step ·{' '}
        <span className="text-text-muted">←</span> back · <span className="text-text-muted">R</span> reset ·{' '}
        <span className="text-text-muted">enter</span> loads the array
      </p>

      <h2 className="sr-only">Array visualization</h2>
      <ArrayTrack
        arr={arr}
        mode={mode}
        l={s.l}
        r={s.r}
        mid={s.mid}
        ans={s.ans}
        finished={s.finished}
        foundIdx={s.foundIdx}
        excluded={s.excluded}
      />

      <Legend
        items={[
          { swatch: 'bg-accent/10 border-accent/50', label: '[l, r] window' },
          { swatch: 'bg-highlight/15 border-highlight', label: 'mid' },
          { swatch: 'bg-success/15 border-success', label: 'answer' },
          { swatch: 'border-line opacity-50', label: 'discarded' },
        ]}
      />

      <StatChips chips={chips} />
      <StatusBar html={s.statusHtml} />
    </div>
  )
}

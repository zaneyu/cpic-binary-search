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
import { ArrayTrack } from '../components/viz/ArrayTrack'
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
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
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
    { label: 'l', value: s.l > s.r ? '—' : s.l },
    { label: 'mid', value: s.mid === -1 ? '—' : s.mid },
    { label: 'r', value: s.l > s.r ? '—' : s.r },
    { label: 'ans', value: s.ans === -1 ? '-1' : s.ans, tone: 'ans' },
    { label: 'steps', value: s.steps },
  ]

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="font-mono text-[12px] text-text-hint">// search · binary_search.cpp</div>
        <h1 className="font-mono text-xl font-semibold tracking-tight text-heading">
          binary search<span className="caret align-middle" />
        </h1>
        <RichText
          className="mt-1 font-mono text-[13px] leading-relaxed text-text-muted"
          html={
            'Three ways to search a sorted list. Each takes only $O(\\log n)$ steps — far faster than checking elements one by one ($O(n)$). We keep two markers $l$ and $r$ for the part still to check, and loop while $l \\le r$. The highlighted line is the one running right now.'
          }
        />
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-text-muted">Array</label>
        <TextInput
          className="min-w-[200px] flex-1"
          value={arrInput}
          onChange={(e) => setArrInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadArray()}
        />
        <Button onClick={loadArray}>Load</Button>
        <Button variant="subtle" onClick={loadRandom}>
          Random
        </Button>
      </div>
      <p className={hintWarn ? 'text-xs text-danger' : 'text-xs text-text-hint'}>{hint}</p>

      <section className="rounded-[3px] border border-line-strong bg-surface p-4">
        <Segmented<Mode>
          groupId="search-mode"
          ariaLabel="Search mode"
          value={mode}
          onChange={setMode}
          options={(['search', 'lower', 'upper'] as Mode[]).map((m) => ({ value: m, label: MODE_LABELS[m] }))}
        />
        <RichText
          className="mt-2.5 text-[13px] leading-relaxed text-text-muted [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent"
          html={MODE_DESCS[mode]}
        />
        <div className="mt-2.5">
          <CodePanel id="search" lines={CODE_TEMPLATES[mode]} activeLine={s.activeLine} />
        </div>
        {STL_TEMPLATES[mode] && (
          <div className="mt-3">
            <div className="mb-1 text-xs text-text-muted">Or skip the loop — C++ already has this built in:</div>
            <pre className="cpic-scroll overflow-x-auto rounded-md border border-line bg-bg px-3 py-3 font-mono text-xs leading-[1.55] text-text-muted">
              {STL_TEMPLATES[mode]}
            </pre>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="text-sm text-text-muted">Target</label>
        <TextInput
          type="number"
          className="w-20 text-center"
          value={targetStr}
          onChange={(e) => setTargetStr(e.target.value)}
        />
        <Button variant="primary" onClick={stepper.play}>
          Start
        </Button>
        <Button onClick={stepper.back} disabled={!stepper.canBack}>
          ← Back
        </Button>
        <Button onClick={stepper.step}>Step →</Button>
        <Button onClick={stepper.reset}>Reset</Button>
        <SpeedSlider value={4000 - delay} onChange={setDelay} />
      </div>

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

      <StatChips chips={chips} />
      <StatusBar html={s.statusHtml} />
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCheck,
  initBsta,
  isFinished,
  stepBsta,
  PROBLEM_CODE,
  type BstaState,
  type ParsedParams,
} from '../engines/bstaEngine'
import { useStepper } from '../hooks/useStepper'
import { RichText } from '../lib/math'
import { PROBLEM_META, parseProblem, type ProblemKey } from '../data/bstaContent'
import { Button, Segmented, SpeedSlider, Switch, TextInput } from '../components/ui/controls'
import { IconNext, IconPlay, IconPrev, IconReset } from '../components/ui/icons'
import { CodePanel } from '../components/viz/CodePanel'
import { Legend } from '../components/viz/Legend'
import { NumberLine } from '../components/viz/NumberLine'
import { MonotonicityCurve } from '../components/viz/MonotonicityCurve'
import { StatChips, type Chip } from '../components/viz/StatChips'
import { StatusBar } from '../components/viz/StatusBar'

const FALLBACK: ParsedParams = { kind: 'custom', lo: 0, hi: 0, dir: 'min', checkFn: () => false }
const defaultsFor = (key: ProblemKey): Record<string, string> =>
  Object.fromEntries(PROBLEM_META[key].params.map((p) => [p.id, p.value]))

export function BstaView({ active }: { active: boolean }) {
  const [problemKey, setProblemKey] = useState<ProblemKey>('logs')
  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor('logs'))
  const [fnText, setFnText] = useState(PROBLEM_META.custom.defaultFn!)
  const [showAll, setShowAll] = useState(false)
  const [delay, setDelay] = useState(1800)

  const parse = useMemo(
    () => parseProblem(problemKey, (id) => values[id] ?? '', fnText),
    [problemKey, values, fnText],
  )
  const params = parse.params ?? FALLBACK
  const hasParams = !!parse.params

  const stepper = useStepper<BstaState>({
    init: () => initBsta(params),
    step: (st) => stepBsta(params, st),
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

  const serialized = JSON.stringify(values) + fnText + problemKey
  useEffect(() => {
    resetRef.current()
  }, [serialized])

  // On problem switch, reset inputs + curve reveal.
  function switchProblem(key: ProblemKey) {
    setProblemKey(key)
    setValues(defaultsFor(key))
    setShowAll(false)
  }

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

  const meta = PROBLEM_META[problemKey]
  const codeLines = PROBLEM_CODE[problemKey].map((line) =>
    problemKey === 'custom' && hasParams && params.kind === 'custom'
      ? line.replace(/\bLO\b/g, String(params.lo)).replace(/\bHI\b/g, String(params.hi))
      : line,
  )
  const check = useMemo(() => getCheck(params), [params])

  const chips: Chip[] = [
    { label: 'l', value: !hasParams || s.l > s.r ? '—' : s.l },
    { label: 'mid', value: s.mid === -1 ? '—' : s.mid },
    { label: 'r', value: !hasParams || s.l > s.r ? '—' : s.r },
    { label: 'ans', value: s.ans === -1 ? '-1' : s.ans, tone: 'ans' },
    {
      label: 'check(mid)',
      value: s.lastCheck === null ? '—' : s.lastCheck ? 'true' : 'false',
      tone: s.lastCheck === null ? 'default' : s.lastCheck ? 'true' : 'false',
    },
  ]

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="font-mono text-[12px] text-text-hint">// search · binary_search_answer.cpp</div>
        <h1 className="font-mono text-xl font-semibold tracking-tight text-heading">
          binary search the answer
        </h1>
        <RichText
          className="prose-sans mt-1 max-w-[68ch] text-sm leading-relaxed text-text-muted"
          html={
            'Sometimes the thing you\'re looking for isn\'t in a list — it\'s a number in a range $[l, r]$. You have a $\\text{check}(x)$ that says "yes that works" or "no it doesn\'t"; pick a guess $x$, test it, narrow down. Works whenever $\\text{check}$ has a clean cutoff: once it flips, it never flips back.'
          }
        />
      </header>

      <section aria-labelledby="bsta-problem-heading" className="rounded-[3px] border border-line-strong bg-surface p-4">
        <h2 id="bsta-problem-heading" className="sr-only">
          Problem and check function
        </h2>
        <Segmented<ProblemKey>
          groupId="bsta-problem"
          ariaLabel="Problem"
          value={problemKey}
          onChange={switchProblem}
          options={(['logs', 'ducks', 'custom'] as ProblemKey[]).map((k) => ({ value: k, label: PROBLEM_META[k].label }))}
        />
        <RichText
          className="prose-sans mt-2.5 max-w-[70ch] text-sm leading-relaxed text-text-muted [&_code]:rounded-[2px] [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent [&_em]:text-text-muted"
          html={meta.desc}
        />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
        {meta.params.map((p) =>
          p.kind === 'select' ? (
            <label key={p.id} className="rounded-[3px] border border-line bg-surface px-2.5 py-2">
              <span className="mb-1 block text-[11px] text-text-muted">{p.label}</span>
              <select
                className="h-8 w-full cursor-pointer touch-manipulation rounded-[2px] border border-line-strong bg-surface-muted px-2 font-mono text-[13px] text-text outline-none transition-colors pointer-coarse:min-h-11 pointer-coarse:text-base focus:border-accent focus:ring-1 focus:ring-accent/40"
                value={values[p.id] ?? p.value}
                onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
              >
                {p.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label key={p.id} className="rounded-[3px] border border-line bg-surface px-2.5 py-2">
              <span className="mb-1 block text-[11px] text-text-muted">{p.label}</span>
              <TextInput
                type={p.kind === 'number' ? 'number' : 'text'}
                className="h-8 w-full"
                value={values[p.id] ?? p.value}
                onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
              />
            </label>
          ),
        )}
      </div>

      {meta.hasCustomFn && (
        <div className="rounded-[3px] border border-line bg-surface p-3">
          <div className="mb-1.5 text-[11px] text-text-muted">check(x) — return true if x is "good"</div>
          <textarea
            spellCheck={false}
            value={fnText}
            onChange={(e) => setFnText(e.target.value)}
            className="min-h-[60px] w-full resize-y touch-manipulation rounded-[2px] border border-line-strong bg-surface-muted px-2.5 py-2 font-mono text-xs leading-[1.55] text-text outline-none transition-colors pointer-coarse:text-[16px] focus:border-accent focus:ring-1 focus:ring-accent/40"
          />
        </div>
      )}

      <CodePanel id="bsta" lines={codeLines} activeLine={s.activeLine} />

      <div className="flex flex-wrap items-center gap-2.5">
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
        <span className="text-text-muted">←</span> back · <span className="text-text-muted">R</span> reset
      </p>

      <h2 className="sr-only">Monotonicity and number-line visualization</h2>
      <div className="cpic-scroll overflow-x-auto rounded-[3px] border border-line-strong bg-surface px-5 pb-3 pt-4">
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-text-muted">
          <span className="tracking-wide">check(x) for each value of x</span>
          <Switch checked={showAll} onChange={setShowAll} label="Show all results" />
        </div>
        <MonotonicityCurve lo={s.initialLo} hi={s.initialHi} probed={s.probed} showAll={showAll} check={check} />
        <NumberLine
          lo={s.initialLo}
          hi={s.initialHi}
          l={s.l}
          r={s.r}
          mid={s.mid}
          ans={s.ans}
          finished={s.finished}
          trueGoodLo={s.trueGoodLo}
          trueGoodHi={s.trueGoodHi}
        />
      </div>

      <Legend
        items={[
          { swatch: 'bg-accent border-accent', label: '[l, r] window' },
          { swatch: 'bg-highlight border-highlight', label: 'mid' },
          { swatch: 'bg-success border-success', label: 'ans' },
          { swatch: 'bg-success/15 border-success/50', label: 'true region' },
          { swatch: 'bg-danger/20 border-danger', label: 'false region' },
        ]}
      />

      <StatChips chips={chips} />
      <StatusBar html={hasParams ? s.statusHtml : `<span style="color:var(--danger);font-weight:500;">${parse.error}</span>`} />

      <div className="cpic-scroll max-h-[120px] overflow-y-auto rounded-[3px] border border-line-strong bg-surface-muted px-3 py-2.5 font-mono text-[11px] leading-relaxed text-text-muted">
        {s.traceLines.length === 0 ? (
          <span className="italic text-text-hint">check() trace will appear here as the search runs.</span>
        ) : (
          s.traceLines.map((t, i) => <RichText key={i} html={t} className="py-px" />)
        )}
      </div>
    </div>
  )
}

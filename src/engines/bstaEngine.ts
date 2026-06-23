// Pure binary-search-the-answer engine. Ported from legacy/index.html (PROBLEMS + step()).
// Problems: log cutting (min), duck transport (min), custom check fn (min|max).

export type Dir = 'min' | 'max'

export type ParsedParams =
  | { kind: 'logs'; lengths: number[]; k: number }
  | { kind: 'ducks'; n: number; d: number }
  | { kind: 'custom'; lo: number; hi: number; dir: Dir; checkFn: (x: number) => boolean }

export interface BstaState {
  l: number
  r: number
  mid: number
  ans: number
  steps: number
  finished: boolean
  lastCheck: boolean | null
  activeLine: number | null
  initialLo: number
  initialHi: number
  trueGoodLo: number | null
  trueGoodHi: number | null
  probed: Map<number, boolean>
  statusHtml: string
  traceLines: string[]
}

const stepsWord = (n: number) => `${n} step${n === 1 ? '' : 's'}`

export function directionOf(p: ParsedParams): Dir {
  return p.kind === 'custom' ? p.dir : 'min'
}

export function loOf(p: ParsedParams): number {
  if (p.kind === 'logs') return 1
  if (p.kind === 'ducks') return 1
  return p.lo
}

export function hiOf(p: ParsedParams): number {
  if (p.kind === 'logs') return Math.max(...p.lengths)
  if (p.kind === 'ducks') return Math.max(p.n, 1)
  return p.hi
}

export function getCheck(p: ParsedParams): (x: number) => boolean {
  if (p.kind === 'logs') {
    return (x) => {
      let cuts = 0
      for (const len of p.lengths) cuts += Math.ceil(len / x) - 1
      return cuts <= p.k
    }
  }
  if (p.kind === 'ducks') {
    return (x) => {
      const walk = p.n - p.d
      if (walk <= 0) return true
      let hrs = 0
      for (let i = 1; i <= walk; i++) hrs += Math.ceil(i / x)
      return hrs <= p.d
    }
  }
  return (x) => p.checkFn(x)
}

export function getTrace(p: ParsedParams): (x: number) => string {
  if (p.kind === 'logs') {
    return (x) => {
      let total = 0
      const parts = p.lengths.map((len) => {
        const c = Math.ceil(len / x) - 1
        total += c
        return `\\lceil ${len}/${x} \\rceil - 1 = ${c}`
      })
      const cmp = total <= p.k ? `\\leq ${p.k}` : `\\gt ${p.k}`
      return `$x = ${x}$: $\\mathit{cuts} = ${parts.join(' + ')} = ${total} ${cmp}$ ${total <= p.k ? '✓' : '✗'}`
    }
  }
  if (p.kind === 'ducks') {
    return (x) => {
      const walk = p.n - p.d
      if (walk <= 0) return `$x = ${x}$: $\\mathit{walk} = ${walk} \\leq 0$, no walking needed ✓`
      let hrs = 0
      const parts: string[] = []
      for (let i = 1; i <= walk; i++) {
        const c = Math.ceil(i / x)
        hrs += c
        parts.push(`\\lceil ${i}/${x} \\rceil = ${c}`)
      }
      const cmp = hrs <= p.d ? `\\leq ${p.d}` : `\\gt ${p.d}`
      return `$x = ${x}$: $\\mathit{hrs} = ${parts.join(' + ')} = ${hrs} ${cmp}$ ${hrs <= p.d ? '✓' : '✗'}`
    }
  }
  return (x) => {
    const r = p.checkFn(x)
    const colored = r ? '\\textcolor{#6dc395}{\\text{true}}' : '\\textcolor{#d96a6a}{\\text{false}}'
    return `$x = ${x}$: $\\text{check}(x) = ${colored}$ ${r ? '✓' : '✗'}`
  }
}

/** Build a custom check from user JS, with the legacy boolean smoke-test + error copy. */
export function buildCustomCheck(fnText: string): (x: number) => boolean {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function('x', fnText) as (x: number) => unknown
  return (x: number) => {
    const r = fn(x)
    if (typeof r !== 'boolean') {
      throw new Error(`check() must return a boolean (got ${typeof r}).`)
    }
    return r
  }
}

export function initBsta(p: ParsedParams): BstaState {
  const lo = loOf(p)
  const hi = hiOf(p)
  const dir = directionOf(p)
  return {
    l: lo,
    r: hi,
    mid: -1,
    ans: -1,
    steps: 0,
    finished: false,
    lastCheck: null,
    activeLine: null,
    initialLo: lo,
    initialHi: hi,
    trueGoodLo: null,
    trueGoodHi: null,
    probed: new Map(),
    statusHtml: `Ready! We'll search $x$ values from $${lo}$ to $${hi}$, looking for the <strong>${dir === 'min' ? 'smallest' : 'largest'}</strong> $x$ that makes $\\text{check}(x)$ true.`,
    traceLines: [],
  }
}

export function isFinished(s: BstaState): boolean {
  return s.finished
}

export function stepBsta(p: ParsedParams, prev: BstaState): BstaState {
  if (prev.finished) return prev
  const s: BstaState = { ...prev, probed: new Map(prev.probed), traceLines: [...prev.traceLines] }
  const dir = directionOf(p)

  if (s.l > s.r) {
    s.finished = true
    s.activeLine = null
    s.mid = -1
    if (s.ans === -1) {
      s.statusHtml = `<span style="color:var(--warning);font-weight:500;">Done — $l$ passed $r$.</span> No value of $x$ made $\\text{check}$ true. ${stepsWord(s.steps)}.`
    } else {
      s.statusHtml = `<span style="color:var(--success);font-weight:500;">Done — $l$ passed $r$.</span> The answer is $${s.ans}$. Took ${stepsWord(s.steps)}.`
    }
    return s
  }

  s.activeLine = 2
  s.mid = Math.floor((s.l + s.r) / 2)
  s.steps++
  const isGood = getCheck(p)(s.mid)
  s.lastCheck = isGood
  s.probed.set(s.mid, isGood)
  s.traceLines.push(getTrace(p)(s.mid))

  if (isGood) {
    if (dir === 'min') {
      if (s.trueGoodLo === null || s.mid < s.trueGoodLo) s.trueGoodLo = s.mid
      if (s.trueGoodHi === null) s.trueGoodHi = s.initialHi
    } else {
      if (s.trueGoodHi === null || s.mid > s.trueGoodHi) s.trueGoodHi = s.mid
      if (s.trueGoodLo === null) s.trueGoodLo = s.initialLo
    }
    s.activeLine = 4
    s.ans = s.mid
    if (dir === 'min') {
      s.statusHtml = `Step $${s.steps}$: $\\text{check}(${s.mid}) =$ <span style="color:var(--success);font-weight:500;">$\\text{true}$</span> — $${s.mid}$ works! Save it as $\\text{ans} = ${s.mid}$, then look left ($r = ${s.mid - 1}$) to see if something smaller also works.`
      s.r = s.mid - 1
    } else {
      s.statusHtml = `Step $${s.steps}$: $\\text{check}(${s.mid}) =$ <span style="color:var(--success);font-weight:500;">$\\text{true}$</span> — $${s.mid}$ works! Save it as $\\text{ans} = ${s.mid}$, then look right ($l = ${s.mid + 1}$) to see if something bigger also works.`
      s.l = s.mid + 1
    }
  } else {
    s.activeLine = 7
    if (dir === 'min') {
      s.statusHtml = `Step $${s.steps}$: $\\text{check}(${s.mid}) =$ <span style="color:var(--danger);font-weight:500;">$\\text{false}$</span> — $${s.mid}$ is too small. Try bigger: $l = ${s.mid + 1}$.`
      s.l = s.mid + 1
    } else {
      s.statusHtml = `Step $${s.steps}$: $\\text{check}(${s.mid}) =$ <span style="color:var(--danger);font-weight:500;">$\\text{false}$</span> — $${s.mid}$ is too big. Try smaller: $r = ${s.mid - 1}$.`
      s.r = s.mid - 1
    }
  }
  return s
}

// ---- Code templates shown in the CodePanel (per problem) ----
export const PROBLEM_CODE: Record<ParsedParams['kind'], string[]> = {
  logs: [
    'int l = 1, r = max(a), ans = -1;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (check(mid)) {',
    '        ans = mid;',
    '        r = mid - 1;',
    '    } else {',
    '        l = mid + 1;',
    '    }',
    '}',
    '// check(x): sum of ceil(a[i]/x)-1 <= K',
  ],
  ducks: [
    'int l = 1, r = N, ans = -1;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (check(mid)) {',
    '        ans = mid;',
    '        r = mid - 1;',
    '    } else {',
    '        l = mid + 1;',
    '    }',
    '}',
    '// check(K): can the N-D walking ducks reach home in D hours?',
  ],
  custom: [
    'int l = LO, r = HI, ans = -1;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (check(mid)) {',
    '        ans = mid;',
    '        // shrink toward better extreme',
    '    } else {',
    '        // shrink the other way',
    '    }',
    '}',
  ],
}

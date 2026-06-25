// Pure binary-search engine: equality search + lower_bound + upper_bound.
// Ported faithfully from legacy/index.html (stepSearch / stepBound). No DOM, no React.

export type Mode = 'search' | 'lower' | 'upper'

export interface SearchState {
  arr: number[]
  mode: Mode
  target: number
  l: number
  r: number
  mid: number
  ans: number
  steps: number
  finished: boolean
  foundIdx: number
  excluded: Set<number>
  activeLine: number | null
  statusHtml: string
}

const bold = (s: string) => `<span style="font-weight:500;">${s}</span>`
const stepsWord = (n: number) => `${n} step${n === 1 ? '' : 's'}`

export function initSearch(arr: number[], mode: Mode, target: number): SearchState {
  const modeFriendly =
    mode === 'search'
      ? 'finding the target'
      : mode === 'lower'
        ? 'counting elements &lt; x'
        : 'counting elements &gt; x'
  // For lower_bound / upper_bound, ans defaults to n (the not-found position,
  // i.e. "all elements are on the other side"). Equality search leaves ans = -1
  // (it never uses ans).
  const ans = mode === 'search' ? -1 : arr.length
  return {
    arr,
    mode,
    target,
    l: 0,
    r: arr.length - 1,
    mid: -1,
    ans,
    steps: 0,
    finished: false,
    foundIdx: -1,
    excluded: new Set<number>(),
    activeLine: null,
    statusHtml: `Starting ${bold(modeFriendly)}. We begin with $l = 0$, $r = ${arr.length - 1}$, $\\text{ans} = ${ans}$.`,
  }
}

function clone(s: SearchState): SearchState {
  return { ...s, excluded: new Set(s.excluded) }
}

export function isFinished(s: SearchState): boolean {
  return s.finished
}

export function stepSearch(prev: SearchState): SearchState {
  if (prev.finished) return prev
  const s = clone(prev)
  return s.mode === 'search' ? stepEquality(s) : stepBound(s)
}

function stepEquality(s: SearchState): SearchState {
  const { target } = s
  if (s.l > s.r) {
    s.finished = true
    s.foundIdx = -1
    s.activeLine = 7
    s.mid = -1
    s.statusHtml = `<span style="color:var(--danger);font-weight:500;">Done — $l$ passed $r$.</span> $${target}$ isn't in the list. Return $-1$. Took ${stepsWord(s.steps)}.`
    return s
  }
  s.activeLine = 2
  s.mid = Math.floor((s.l + s.r) / 2)
  s.steps++
  const midVal = s.arr[s.mid]
  if (midVal === target) {
    s.activeLine = 3
    s.finished = true
    s.foundIdx = s.mid
    s.statusHtml = `<span style="color:var(--success);font-weight:500;">Found it! $\\text{arr}[${s.mid}] = ${target}$. Return $${s.mid}$.</span> Took ${stepsWord(s.steps)}.`
    return s
  }
  if (midVal < target) {
    s.activeLine = 4
    s.statusHtml = `Step $${s.steps}$: $\\text{arr}[${s.mid}] = ${midVal}$ is ${bold(`smaller than $${target}$`)}, so the target must be to the right. Move $l$ past the middle: $l = ${s.mid + 1}$.`
    for (let i = s.l; i <= s.mid; i++) s.excluded.add(i)
    s.l = s.mid + 1
  } else {
    s.activeLine = 5
    s.statusHtml = `Step $${s.steps}$: $\\text{arr}[${s.mid}] = ${midVal}$ is ${bold(`bigger than $${target}$`)}, so the target must be to the left. Move $r$ before the middle: $r = ${s.mid - 1}$.`
    for (let i = s.mid; i <= s.r; i++) s.excluded.add(i)
    s.r = s.mid - 1
  }
  return s
}

function stepBound(s: SearchState): SearchState {
  const { target, mode } = s
  const boundName = mode === 'lower' ? 'lower\\_bound' : 'upper\\_bound'
  if (s.l > s.r) {
    s.finished = true
    s.foundIdx = s.ans
    s.activeLine = null
    s.mid = -1
    const cmpWord = mode === 'lower' ? 'at least' : 'greater than'
    const allWord = mode === 'lower' ? 'less than' : 'at most'
    const n = s.arr.length
    if (s.ans === n) {
      s.statusHtml = `<span style="color:var(--success);font-weight:500;">Done — $l$ passed $r$.</span> No element is ${cmpWord} $${target}$, so $\\text{${boundName}} = n = ${n}$ — all ${n} elements are ${allWord} $${target}$. Took ${stepsWord(s.steps)}.`
    } else {
      s.statusHtml = `<span style="color:var(--success);font-weight:500;">Done — $l$ passed $r$.</span> $\\text{${boundName}} = ${s.ans}$. $\\text{arr}[${s.ans}] = ${s.arr[s.ans]}$ is the first element ${cmpWord} $${target}$. Took ${stepsWord(s.steps)}.`
    }
    return s
  }
  s.activeLine = 2
  s.mid = Math.floor((s.l + s.r) / 2)
  s.steps++
  const midVal = s.arr[s.mid]
  const isGood = mode === 'lower' ? midVal >= target : midVal > target
  const goodWord = mode === 'lower' ? 'at least' : 'greater than'
  const badWord = mode === 'lower' ? 'less than' : 'at most'
  if (isGood) {
    s.activeLine = 4
    s.statusHtml = `Step $${s.steps}$: $\\text{arr}[${s.mid}] = ${midVal}$ is ${bold(`${goodWord} $${target}$`)} — this index works! Save it as $\\text{ans} = ${s.mid}$, then look left ($r = ${s.mid - 1}$) for an even earlier match.`
    for (let i = s.mid; i <= s.r; i++) s.excluded.add(i)
    s.ans = s.mid
    s.r = s.mid - 1
  } else {
    s.activeLine = 7
    s.statusHtml = `Step $${s.steps}$: $\\text{arr}[${s.mid}] = ${midVal}$ is ${bold(`${badWord} $${target}$`)} — doesn't work, need to look right. Move $l = ${s.mid + 1}$.`
    for (let i = s.l; i <= s.mid; i++) s.excluded.add(i)
    s.l = s.mid + 1
  }
  return s
}

import { buildCustomCheck, type Dir, type ParsedParams } from '../engines/bstaEngine'

export type ProblemKey = 'logs' | 'ducks' | 'custom'

export type ParamField =
  | { id: string; label: string; kind: 'text' | 'number'; value: string }
  | { id: string; label: string; kind: 'select'; value: string; options: string[] }

export interface ProblemMeta {
  label: string
  desc: string
  params: ParamField[]
  hasCustomFn?: boolean
  defaultFn?: string
}

export const PROBLEM_META: Record<ProblemKey, ProblemMeta> = {
  logs: {
    label: 'Log cutting',
    desc:
      'You have $N$ logs of lengths $a_1, a_2, \\ldots, a_N$. You\'re allowed $K$ cuts total (each cut chops one log into two pieces). What\'s the <span style="font-weight:500;">smallest possible length of the longest remaining piece</span>? <br><br>To make every piece at most $x$ long, a single log of length $a$ needs $\\lceil a/x \\rceil - 1$ cuts. <em>Notice: the bigger you allow $x$ to be, the fewer cuts you need — so once a value of $x$ works, every bigger value works too.</em>',
    params: [
      { id: 'arr', label: 'Log lengths', kind: 'text', value: '7, 9, 11' },
      { id: 'k', label: 'K (cuts)', kind: 'number', value: '4' },
    ],
  },
  ducks: {
    label: 'Duck transport',
    desc:
      'There are $N$ ducks at position $0$ and $N$ houses at positions $1, 2, \\ldots, N$. Each hour you can: <strong>(a)</strong> teleport one duck to any house, AND <strong>(b)</strong> move one duck forward by up to $K$ steps. After $D$ hours every house needs a duck in it. What\'s the <span style="font-weight:500;">smallest $K$</span> that makes this possible? <br><br><strong>Plan:</strong> teleport the $D$ ducks to the $D$ furthest houses (no walking needed); the other $N - D$ ducks walk to the closest houses. A duck reaching house $i$ takes $\\lceil i / K \\rceil$ hours. <em>Notice: bigger $K$ means ducks move faster, so once a $K$ works, every larger $K$ works too.</em>',
    params: [
      { id: 'n', label: 'N (ducks/houses)', kind: 'number', value: '6' },
      { id: 'd', label: 'D (hours)', kind: 'number', value: '3' },
    ],
  },
  custom: {
    label: 'Custom',
    desc:
      'Write your own $\\text{check}(x)$ function below — it should return <code>true</code> when $x$ is "good" and <code>false</code> otherwise. Pick <em>min</em> to hunt for the smallest good $x$, or <em>max</em> for the largest. Important: $\\text{check}$ must have a clean cutoff — once it flips from false to true (or true to false), it can\'t flip back. Your code has access to $x$ and must <code>return</code> <code>true</code> or <code>false</code>.',
    params: [
      { id: 'lo', label: 'l (range start)', kind: 'number', value: '1' },
      { id: 'hi', label: 'r (range end)', kind: 'number', value: '100' },
      { id: 'dir', label: 'Direction', kind: 'select', value: 'min', options: ['min', 'max'] },
    ],
    hasCustomFn: true,
    defaultFn: '// Return true if x is a feasible answer.\n// Available: x (the candidate value)\nreturn x * x >= 50;',
  },
}

export interface ParamParse {
  params?: ParsedParams
  error?: string
}

export function parseProblem(
  key: ProblemKey,
  get: (id: string) => string,
  fnText: string,
): ParamParse {
  if (key === 'logs') {
    const lengths = get('arr').split(/[,\s]+/).filter(Boolean).map(Number)
    const k = Number(get('k'))
    if (lengths.some(Number.isNaN) || lengths.length === 0) return { error: 'Invalid log lengths.' }
    if (Number.isNaN(k) || k < 0) return { error: 'K must be a non-negative integer.' }
    return { params: { kind: 'logs', lengths, k } }
  }
  if (key === 'ducks') {
    const n = Number(get('n'))
    const d = Number(get('d'))
    if (Number.isNaN(n) || n < 1) return { error: 'N must be ≥ 1.' }
    if (Number.isNaN(d) || d < 0) return { error: 'D must be ≥ 0.' }
    return { params: { kind: 'ducks', n, d } }
  }
  const lo = Number(get('lo'))
  const hi = Number(get('hi'))
  const dir = get('dir') as Dir
  if (Number.isNaN(lo) || Number.isNaN(hi)) return { error: 'l and r must be numbers.' }
  if (lo > hi) return { error: 'l must be ≤ r.' }
  let checkFn: (x: number) => boolean
  try {
    checkFn = buildCustomCheck(fnText)
    checkFn(lo) // smoke test (throws on non-boolean)
  } catch (e) {
    return { error: `check() error: ${(e as Error).message}` }
  }
  return { params: { kind: 'custom', lo, hi, dir, checkFn } }
}

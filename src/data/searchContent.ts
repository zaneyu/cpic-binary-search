import type { Mode } from '../engines/searchEngine'

export const MODE_LABELS: Record<Mode, string> = {
  search: 'Search',
  lower: 'Count < x (lower_bound)',
  upper: 'Count > x (upper_bound)',
}

export const MODE_DESCS: Record<Mode, string> = {
  search:
    'Find where the target is in the list. Returns its position $i$ (so $\\text{arr}[i] = \\text{target}$), or $-1$ if it isn\'t there.',
  lower:
    '<span style="font-weight:500;">How many numbers in the list are less than $x$?</span> Here\'s the trick: that count is the same as the position of the first number that\'s $\\geq x$ — which is exactly what <code>lower_bound</code> gives you. One binary search ($O(\\log n)$) answers the question.<br><br><span style="font-weight:500;">C++ shortcut:</span> <code>int cnt = lower_bound(v.begin(), v.end(), x) - v.begin();</code>',
  upper:
    '<span style="font-weight:500;">How many numbers in the list are greater than $x$?</span> Use <code>upper_bound</code> to find the position of the first number $> x$. Everything from that position to the end is bigger than $x$ — that\'s $n - \\text{upper\\_bound}(x)$ numbers in total.<br><br><span style="font-weight:500;">C++ shortcut:</span> <code>int cnt = n - (upper_bound(v.begin(), v.end(), x) - v.begin());</code>',
}

export const CODE_TEMPLATES: Record<Mode, string[]> = {
  search: [
    'int l = 0, r = n - 1;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (arr[mid] == target) return mid;',
    '    else if (arr[mid] < target) l = mid + 1;',
    '    else r = mid - 1;',
    '}',
    'return -1;',
  ],
  lower: [
    'int l = 0, r = n - 1, ans = n;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (arr[mid] >= x) {',
    '        ans = mid;',
    '        r = mid - 1;',
    '    } else {',
    '        l = mid + 1;',
    '    }',
    '}',
  ],
  upper: [
    'int l = 0, r = n - 1, ans = n;',
    'while (l <= r) {',
    '    int mid = (l + r) / 2;',
    '    if (arr[mid] > x) {',
    '        ans = mid;',
    '        r = mid - 1;',
    '    } else {',
    '        l = mid + 1;',
    '    }',
    '}',
  ],
}

export const STL_TEMPLATES: Partial<Record<Mode, string>> = {
  lower:
    'vector<int> v = {1, 3, 4, 6, 9};\n' +
    'int target = 5;\n' +
    '\n' +
    '// number of elements < target\n' +
    'int count = lower_bound(v.begin(), v.end(), target) - v.begin();  // 3\n' +
    '\n' +
    '// the first element >= target\n' +
    'int value = *lower_bound(v.begin(), v.end(), target);             // 6',
  upper:
    'vector<int> v = {1, 3, 4, 6, 9};\n' +
    'int target = 4;\n' +
    '\n' +
    '// number of elements > target\n' +
    'int count = v.size() - (upper_bound(v.begin(), v.end(), target) - v.begin());  // 2\n' +
    '\n' +
    '// the first element > target\n' +
    'int value = *upper_bound(v.begin(), v.end(), target);                          // 6',
}

export const DEFAULT_ARRAY = [2, 2, 3, 5, 6, 7, 8]
export const DEFAULT_TARGET = 3
export const MAX_ELEMENTS = 40

export interface ParseResult {
  nums?: number[]
  error?: string
}

export function parseArray(str: string): ParseResult {
  const parts = str.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
  const nums: number[] = []
  for (const p of parts) {
    const n = Number(p)
    if (Number.isNaN(n)) return { error: `Could not parse "${p}" as a number.` }
    nums.push(n)
  }
  if (nums.length === 0) return { error: 'Enter at least one number.' }
  if (nums.length > MAX_ELEMENTS) return { error: `Max ${MAX_ELEMENTS} elements (got ${nums.length}).` }
  return { nums }
}

export function randomArray(): number[] {
  const size = Math.floor(Math.random() * 11) + 10 // 10-20
  const nums: number[] = []
  for (let i = 0; i < size; i++) nums.push(Math.floor(Math.random() * 15) + 1) // 1-15
  return nums.sort((a, b) => a - b)
}

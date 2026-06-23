import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RichText, Math } from './math'

describe('RichText', () => {
  it('renders inline $...$ math while preserving surrounding HTML tags', () => {
    const { container } = render(<RichText html={'count is $x^2$ <b>ok</b>'} />)
    // KaTeX rendered the math
    expect(container.querySelector('.katex')).not.toBeNull()
    // the interleaved HTML tag survived (not escaped, not dropped)
    expect(container.querySelector('b')?.textContent).toBe('ok')
  })
})

describe('Math', () => {
  it('renders a standalone expression', () => {
    const { container } = render(<Math expr={'\\lfloor (l+r)/2 \\rfloor'} />)
    expect(container.querySelector('.katex')).not.toBeNull()
  })
})

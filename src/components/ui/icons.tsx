import type { SVGProps } from 'react'

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export const IconPlay = () => (
  <Svg>
    <path d="M7 4v16l13-8z" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconNext = () => (
  <Svg>
    <path d="M5 12h13" />
    <path d="m12 6 6 6-6 6" />
  </Svg>
)
export const IconPrev = () => (
  <Svg>
    <path d="M19 12H6" />
    <path d="m12 18-6-6 6-6" />
  </Svg>
)
export const IconReset = () => (
  <Svg>
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
)

/**
 * Ambient backdrop for the code-native theme. A faint dot matrix that vignettes
 * away from the reading column, a single cool light source at the top, and a
 * hairline horizon seam — no full-bleed graph grid, no blurred blob. All styling
 * lives in index.css (`.cpic-*`) so the layers stay token-driven and theme-aware.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="cpic-backdrop">
      <div className="cpic-skyglow" />
      <div className="cpic-dots" />
      <div className="cpic-seam" />
    </div>
  )
}

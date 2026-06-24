/**
 * Flat terminal backdrop: the faint grid lives on <body>; this just softens the
 * edges and adds a barely-there glow so the grid fades into the frame. No motion.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* edge vignette: grid fades to solid bg at the margins */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--bg)_100%)]" />
      {/* faint cool wash from the top */}
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-[linear-gradient(var(--bg),transparent)]" />
      <div className="absolute left-1/2 top-[-10vh] h-[36vh] w-[60vw] -translate-x-1/2 rounded-full bg-accent/5 blur-[90px]" />
    </div>
  )
}

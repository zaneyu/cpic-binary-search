# CPIC Binary Search — React Rebuild Design

**Date:** 2026-06-23
**Status:** Approved (all sections), building on branch `react-rebuild`.

## Goal

Rebuild the existing zero-dependency static teaching site (`index.html` binary-search
animations + BSTA, `bob-guess-game.html`) as a modern React app, with a **faithful port of
all pedagogy** and a dramatic **visual + animation glow-up**: "evolve the current identity,
dialed to 11." No new teaching features.

Decisions locked during brainstorming:

- **A. Same repo**, build to GitHub Pages via GitHub Actions; old HTML archived under `legacy/`.
- **A. Evolve the current identity**: keep cyan -> lavender -> pink on deep navy (+ light mode),
  but add a living aurora/gradient-mesh background, glowing accents, depth/parallax.
- **A. Faithful port**, visual/animation only. Same three surfaces, same math, same shortcuts.
- **Showpieces (all four):** the search animation, the BSTA monotonicity curve, the Bob
  victory/reactions, and the ambient background + page transitions. Each has a calm
  `prefers-reduced-motion` fallback.

## Stack

- **Vite + React 18 + TypeScript**, **Tailwind v4** (`@theme` tokens), **shadcn/ui** primitives.
- **Motion** (`motion`, formerly framer-motion) for orchestrated/layout animation.
- **katex** (bundled, not CDN). The current site uses the **auto-render extension**
  (`renderMathInElement`) to find inline `$...$` / `$$...$$` delimiters inside large HTML
  status/desc strings that **interleave tags** (`<span>`, `<code>`, `<br>`) with math
  (e.g. MODE_DESCS, status narration, check traces). Naive string-splitting would corrupt the
  HTML or render math inside tag context. **Correct approach:** a `<RichText html={...}>`
  component that sets the HTML via `dangerouslySetInnerHTML` on a ref, then runs
  `renderMathInElement(ref, KATEX_OPTS)` in a layout effect (exactly mirroring the original's
  DOM-walking auto-render). A standalone `<Math expr>` (using `katex.renderToString`) is for
  isolated expressions only. **Must** `import "katex/dist/katex.min.css"`.
- **react-router** with **HashRouter** (GitHub Pages has no SPA fallback; hash routing avoids
  404s on refresh and keeps deep-links working).
- **vite-plugin-singlefile** to also emit a self-contained `dist/index.html`. Constraints it
  imposes: **all routes statically imported, no dynamic `import()` / lazy / `AnimatePresence`
  route-splitting that relies on lazy** (single chunk only — fine, 2 routes; `AnimatePresence`
  keys off the resolved route, statically imported).
- **KaTeX fonts in the single file:** `assetsInlineLimit` alone does NOT reliably inline
  `url()`-referenced fonts that `vite-plugin-singlefile` leaves as separate emitted files.
  Concrete method: preprocess `katex.min.css` to embed the **woff2 subset** as `data:` URIs
  (build-time step or a small vite transform), OR accept fallback glyphs. **Math *correctness*
  is verified by unit tests + DOM-text assertions, not screenshots** — so if a verification
  screenshot shows fallback math metrics it is acceptable; the deployed Pages site serves fonts
  normally regardless.
- **Verification transport:** no local HTTP server can bind a socket in this sandbox (bind is
  SIGKILLed) and the Playwright MCP blocks `file://`. Verify by navigating Playwright to a
  **`data:text/html;base64,<dist>` URL** (proven to work this session for the static pages; a
  `data:` URL has a usable `location.hash`, so HashRouter routes resolve and `new Function` runs
  — no CSP is injected). Drive routes by **clicking the nav links** (HashRouter updates the hash)
  rather than trusting the initial URL; screenshot each surface in dark/light/375px.

## Architecture

```
src/
  main.tsx                  # HashRouter + RootLayout
  index.css                 # Tailwind v4 @theme tokens (the design system / single source of truth)
  lib/
    math.tsx                # <Math> + renderMathInString() — handles inline $...$ inside HTML strings
    motion.ts               # shared spring/easing tokens, reduced-motion helpers, variants
    cn.ts                   # className merge (clsx + tailwind-merge)
  engines/                  # PURE TypeScript, no React/DOM — unit-tested
    searchEngine.ts         # equality search / lower_bound / upper_bound state machine
    bstaEngine.ts           # binary-search-the-answer + problem defs (logs/ducks/custom)
    bobEngine.ts            # guess-the-number game logic
    *.test.ts               # vitest specs for each engine
  hooks/
    useStepper.ts           # generic init/step/back/auto-play/history wrapper around an engine
  components/
    layout/RootLayout.tsx   # ambient background + animated top-nav + <Outlet/> transitions
    layout/AmbientBackground.tsx   # layered CSS gradient mesh + optional canvas flow
    layout/TopNav.tsx
    ui/...                  # shadcn components (button, tabs, slider, select, input, switch, tooltip)
    viz/ArrayTrack.tsx      # search: animated array cells (Motion layout)
    viz/NumberLine.tsx      # SVG number line (shared by BSTA + Bob)
    viz/MonotonicityCurve.tsx  # SVG false->true cutoff curve
    viz/CodePanel.tsx       # code template with active-line highlight
    viz/StatChips.tsx       # l / mid / r / ans / steps chips
    viz/StatusBar.tsx       # narration line (renders Math)
    viz/Characters.tsx      # Bob + You faces and speech bubbles
  pages/
    SearchPage.tsx          # route "/", tabs: Binary search | Binary search the answer
    BobPage.tsx             # route "/bob"
```

**Separation principle:** the binary-search logic (the subtle part) lives in pure engines with
no rendering. Each engine exposes immutable snapshots:

```ts
type EngineState = { /* l, r, mid, ans, steps, finished, activeLine, status, ... */ }
interface Engine<S, Cfg> {
  init(cfg: Cfg): S
  step(s: S): S          // one forward step; idempotent at terminal state
  isFinished(s: S): boolean
}
```

`useStepper` wraps any engine to provide `state`, `step()`, `back()` (history stack),
`reset()`, `play()/pause()` (interval), and `canBack`. Components consume `state` and render.
This keeps view files small and the logic testable in isolation.

## Visual system (Section 2)

- **Tokens** in `index.css` `@theme`: port the existing palette **verbatim as hex/sRGB**
  (the current site is plain hex/rgba, NOT OKLCH — do not re-author colors or they will shift):
  `--bg`, `--surface`, `--surface-muted`, `--surface-elevated`, `--text`, `--text-muted`,
  `--text-hint`, `--border`, `--border-strong`, `--accent`, `--accent-2`, `--accent-3`,
  `--success`, `--danger`, `--warning`, `--highlight`, `--heading`, `--grad-accent`,
  `--grad-heading` for dark; a full second set under `prefers-color-scheme: light` (also
  distinct hex, not a tint). Copy the exact values from `index.html:8-53`.
- **shadcn token bridge (required):** shadcn components expect semantic tokens
  (`--background`, `--foreground`, `--primary`, `--card`, `--popover`, `--muted`, `--border`,
  `--input`, `--ring`, etc.). These do NOT match the site's bespoke names. In `@theme inline`,
  map them: `--background<-bg`, `--foreground<-text`, `--card<-surface`, `--primary<-accent`,
  `--border<-border`, `--ring<-accent`, `--muted<-surface-muted`, `--muted-foreground<-text-muted`,
  `--destructive<-danger`, etc. Use shadcn **new-york** style on the **Tailwind v4 init path**
  (CSS-first `@theme`, no `tailwind.config.js`). Tokens must be **bare colors** (e.g. `#5fb8d4`),
  and any vendored component that wraps a token in `hsl(var(--x))`/`oklch(var(--x))` must be
  edited to use the bare color (else it renders garbage). Verify each shadcn component renders
  styled before relying on it.
- **Dark mode mechanism:** the original themes purely via `@media (prefers-color-scheme: light)`
  — there is no theme toggle. Keep that: configure Tailwind v4's dark variant to the **media
  query** (`@custom-variant dark (@media (prefers-color-scheme: dark))`), NOT the default `.dark`
  class, so shadcn `dark:` utilities track OS preference and match the original. No theme-switcher
  UI, no class toggling, no JS preference listener.
- **Headings:** single solid `--heading` (no gradient-clipped text — kept from the polish pass).
  `--grad-heading` is still load-bearing: it draws the **active top-nav underline**
  (`index.html:676-681`), so keep the token even though headings are solid.
- **Ambient background:** `AmbientBackground` renders 4-5 layered radial-gradient blobs that
  slowly drift (CSS `@keyframes` transform/opacity only) for a living aurora, plus an optional
  low-opacity canvas grain/flow. GPU-cheap; fully frozen under reduced-motion.
- **Depth:** soft shadows + subtle parallax on the background relative to scroll/pointer
  (disabled under reduced-motion).
- **Elevation scale & radii** standardized as tokens; glassy surfaces used sparingly and
  purposefully (not as a default).

## The three surfaces (Section 3)

All behavior matches the current site exactly; only presentation changes. **The exact strings,
quirks, chip-sets, reset triggers, keyboard guards, and reveal logic are pinned in Appendix A —
implement against it, not against this prose summary.**

1. **Binary search** (`/`, tab 1): editable array (comma input, auto-sort, Random size 10-20 /
   values 1-15, max 40), mode toggle (search / lower_bound / upper_bound) with the exact
   CODE_TEMPLATES + STL snippets + MODE_DESCS, target input, Start/Step/Back/Reset, speed slider.
   Chip set = **{l, mid, r, ans, steps}**; `ans` is **inert (-1) in equality-search mode** (only
   lower/upper set it). **Showpiece (net-new motion, not a faithful detail — allowed glow-up):**
   the discarded halves desaturate and the `[l,r]` highlight glides via a Motion overlay; the
   mid cell pulses; the final answer cell blooms. The array container is a **wrapping flex row**
   (`flex-wrap`, up to 40 cells, wraps on mobile) — preserve that. Cells keep their slot
   (animate color/opacity/scale only, no `layout` reflow); the `ans` super-label and index labels
   stay pinned to their cell. The glide overlay is computed per-row and must not draw across a
   wrap boundary.
2. **Binary search the answer** (`/`, tab 2): problem toggle (Log cutting / Duck transport /
   Custom check fn via `new Function`, with the boolean smoke-test + error strings), params grid,
   live C++ code with active-line highlight, check() trace, Start/Step/Back/Reset, speed.
   Chip set = **{l, mid, r, ans, check(mid)}** (5th chip is check(mid), NOT steps). Includes the
   **"Show all results" reveal checkbox**. **Showpieces:** `MonotonicityCurve` (three column
   states: probed / revealed / unknown; 200-column stride sampling on big ranges; draw-on as
   values are probed); `NumberLine` markers (l/mid/r/ans) glide with springs; the green "good
   region" grows **direction-aware** — suffix `[mid,hi]` for `min`, prefix `[lo,mid]` for `max`.
3. **Bob's guessing game** (`/bob`): You/Bob faces with escalating reactions, speech-bubble
   springs, number-line range bar snapping shut, guess input + New game, stats, post-game hint.
   Faithful quirks (see Appendix A): **first game target = 67**, subsequent games random 0-100;
   Bob answers **truthfully and always counts the guess**, but the `[lo,hi]` range only clamps
   when the guess is inside it; stat labels and 3-tier hint thresholds (<=7 / <=10 / else) are
   fixed strings. **Showpiece:** victory celebration (bubble bloom, face pulse, range snap,
   subtle confetti/glow burst) — reduced-motion gets an instant, static success state.

## Motion design (Section 4)

- One shared rhythm in `lib/motion.ts`: spring presets (`gentle`, `snappy`, `bounceless`) and
  ease-out curves (quart/expo). Enter from below/scale-in; exit faster than enter. No bounce on
  UI chrome (springs reserved for playful Bob/markers).
- **Page transitions:** `AnimatePresence` crossfade + directional slide between routes/tabs,
  maintaining spatial continuity.
- **Reduced motion:** a single `useReducedMotion` gate swaps every showpiece for an instant or
  minimal-fade variant. Ambient drift, parallax, confetti, and draw-on all disable.
- Prefer `transform`/`opacity`. Exception: the SVG number line positions markers by computed
  `x` (the original transitions `left`/`width`); port these as `transform: translateX()` / scaled
  width on the SVG marker groups (cheap, same feel), and **re-measure the line width on resize**
  (the original recomputes `xPos` from `clientWidth`) so markers don't desync. Don't use Motion
  `layout` on the wrapping array row (see §3.1).

## Testing & verification (Section 5)

- **Vitest unit tests** for all three engines: search finds/▸-1 across duplicates and misses;
  lower_bound/upper_bound counts; BSTA converges to the correct cutoff for logs/ducks/custom and
  respects min/max direction; Bob range-narrowing and win detection. Engines are pure -> fast,
  deterministic tests (seeded where randomness exists).
- **Build gate:** `tsc --noEmit` + `vite build` must pass.
- **Visual verification:** build the single-file artifact and load it in Playwright via a
  `data:text/html;base64,<dist>` URL (see Verification transport above). Drive routes by clicking
  nav links, screenshot each surface in dark + light + 375px mobile, and exercise controls (Step/
  Start, fill inputs, toggle "Show all results") to confirm animation states. Math glyphs may show
  fallback metrics if fonts aren't inlined — that's cosmetic; math correctness is covered by unit
  tests + DOM-text assertions. Compare behavior against the current site.
- **A11y pass:** keyboard parity with the old site, focus-visible rings, contrast >= 4.5:1 in
  both themes, reduced-motion verified.

## Deployment

- `.github/workflows/deploy.yml`: triggers on **push to `main` AND `workflow_dispatch`** (manual
  run lets us deploy/preview before merge if needed). Steps: `npm ci && npm run build`, upload
  `dist/`, deploy to Pages. `vite.config.ts` `base: './'`.
- **Pre-merge gate is local:** `tsc` + `vite build` + vitest + Playwright `data:`-URL
  verification (per Verification transport above). Deployed-Pages verification is **post-merge**
  (the workflow only runs on `main`).
- **Atomic cutover:** in the same merge, move the current root `index.html` /
  `bob-guess-game.html` into `legacy/` AND point Pages at `dist/`, so the live site never 404s.
  Keep `legacy/bob-guess-game.html` reachable (old top-nav and the Bob back-link reference it);
  optionally add a stub redirect from the old paths to the new hash routes.
- Merge `react-rebuild` -> `main` once the pre-merge gate passes.

## Implementation phases (plan seed)

1. Scaffold Vite+TS+Tailwind v4+shadcn; port design tokens; `<Math>`, `motion.ts`, `cn`.
2. RootLayout + AmbientBackground + TopNav + routing + page-transition shell.
3. `searchEngine` + tests -> `useStepper` -> Binary search tab (ArrayTrack, CodePanel, StatChips,
   StatusBar) with showpiece animation.
4. `bstaEngine` + tests -> BSTA tab (MonotonicityCurve, NumberLine, check trace).
5. `bobEngine` + tests -> Bob page (Characters, NumberLine, victory showpiece).
6. Polish pass: parallax, transitions, reduced-motion audit, mobile, light mode.
7. CI workflow + `legacy/` move; build/verify; merge.

## Appendix A — Behavior fidelity (pin these exactly)

Port verbatim from `index.html` / `bob-guess-game.html`. Engine unit tests must assert each.

**Binary search (equality / lower / upper)**
- All three modes use inclusive `[l, r]`, loop while `l <= r`, `mid = floor((l+r)/2)`.
- **Equality search:** never sets `ans`; `ans` chip shows `-1` the entire run. On `arr[mid]==target`
  returns `mid` (success). On miss, returns `-1` with the "l passed r" not-found status.
- **lower_bound:** good if `arr[mid] >= x`; on good save `ans=mid`, `r=mid-1`; else `l=mid+1`.
- **upper_bound:** identical but good if `arr[mid] > x`.
- **Not-found copy** (lower/upper): "No element is {at least|greater than} x, so {lower|upper}_bound
  = -1. (Some libraries return n = N instead — same idea, just a different convention.)"
- `ans` is an **index**, not a value. "count < x = lower_bound(x)", "count > x = n - upper_bound(x)".
- Keep the exact CODE_TEMPLATES (per mode), STL snippets (lower/upper only), and MODE_DESCS HTML.
- **Array input:** comma/space split, parse to numbers, error on NaN / empty / >40 elements; Load
  **auto-sorts ascending** and rewrites the field to the sorted join; hint = "Array was auto-sorted.
  N elements loaded." if it was unsorted, else "N elements loaded.". **Random:** size = 10-20,
  values = 1-15, sorted, hint "N random elements loaded (with possible duplicates).". Default array
  `2, 2, 3, 5, 6, 7, 8`, default target `3`.
- **Reset triggers:** Load, Random, mode switch, **target input change**, Reset, Start (re-reads).

**BSTA**
- Chip set is **{l, mid, r, ans, check(mid)}** — the 5th chip is the boolean check result, styled
  true/false, NOT a step counter.
- Problems: **logs** (`l=1, r=max(a)`, min; `cuts = sum(ceil(a/x)-1) <= K`), **ducks**
  (`l=1, r=max(N,1)`, min; `walk = N-D`; if `walk <= 0` check is **true** with trace
  "walk <= 0, no walking needed ✓"; else `sum_{i=1..walk}(ceil(i/x)) <= D`), **custom**
  (`l,r` from inputs, direction min|max, `check` built via `new Function('x', text)` with a
  boolean smoke-test; error strings: "check() must return a boolean (got T)." / "check() error: …").
- Default params: logs `7, 9, 11` / K `4`; ducks N `6` / D `3`; custom l `1` r `100` dir `min`,
  textarea default `return x * x >= 50;`.
- **Direction semantics:** `min` wants smallest good x (on good: `ans=mid, r=mid-1`); `max` wants
  largest (on good: `ans=mid, l=mid+1`).
- **Monotonicity curve:** one column per integer in `[lo,hi]`, capped at **MAX_COLS=200** with
  integer **stride** sampling beyond that. Column states: **probed** (bright + highlight outline),
  **revealed** (computed only when "Show all results" checkbox on), **unknown** (faded). Each
  column has a `title` = `check(x) = …`.
- **"Show all results" checkbox** (`curve-reveal`) is a real control; resets to unchecked on
  problem switch.
- **Good-region (`nl-good`) progressive reveal:** grows from probed `true` results — for `min`
  a suffix anchored at the smallest probed-true up to `hi`; for `max` a prefix from `lo` to the
  largest probed-true. Tracked via `trueGoodLo/Hi`.
- **check() trace** appends one KaTeX line per step (the per-problem `checkTrace` strings).
- **Number line markers:** `l`/`r` labels and the active `[l,r]` range show only while running
  (`!finished && l<=r`); `mid` marker shows while running; the `ans` marker shows **as soon as
  ans is set and persists through finish** — label is `ans=K` during the run and `✓ ans=K` when
  finished, repositioned (above the line when finished, below during the run). Tick labels: up to
  11 evenly-spaced integer ticks across `[lo,hi]`.

**Bob**
- **First game target = 67** (deterministic); every New game after = `floor(random*101)` in 0-100.
- Always answers truthfully (`Higher!` if guess<target, `Lower!` if guess>target, `Yes! T!` on hit)
  and **always increments the guess count**. The `[lo,hi]` range only updates when the guess is
  within range: `if (guess >= lo) lo = guess+1` / `if (guess <= hi) hi = guess-1`.
- Validation bubbles: empty -> "Type a number first!"; non-integer or out of 0-100 ->
  "It has to be 0-100, integer." (these do NOT count as a guess).
- The guess count is incremented **before** face selection (face uses the new count). Higher!/
  Lower! branches set face = `BOB_FACES[min(7, floor(count*1.2))]`. The **win branch bypasses the
  table**: face = `🤯` if count<=7 else `😅` (the escalation index is computed but discarded), so the
  engine's win state must not read `BOB_FACES`.
- Stats: "Guesses: N", "Optimal max: 7" (static, = ceil(log2(101))), "Range size: N" (starts 101);
  on win the range stat mutates in place to "You won in: K guess(es)" with `.victory` styling.
- **3-tier hint** on win: `<=7` -> celebratory "Optimal binary search needs ceil(log2(101))=7 …";
  `<=10` -> "Binary search would have found it in at most 7 …"; else -> "… always guess the middle
  of the current [l, r] range." (keep the exact copy, including the `<code>[l, r]</code>`).

**Keyboard (both surfaces, now route-scoped)**
- Handlers fire only for the **active route/tab** (was `window.__activePage()` gating).
- Ignore when focus is in `input` / `textarea` / **`select`** (BSTA), or when meta/ctrl/alt held.
- `ArrowRight` or Space (match BOTH `e.key === ' '` and `e.code === 'Space'`) = step (cancels
  auto-play); `ArrowLeft` = back; `r`/`R` = reset. **Enter is scoped to the array input only**
  (reloads the array), not global.

## Non-goals (YAGNI)

No new problems, no share-links, no backend, no SSR, no analytics, no i18n. Faithful port only.

# CPIC React Rebuild — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans or subagent-driven-development to
> implement task-by-task. Steps use `- [ ]` checkboxes. **The spec is the contract:**
> `docs/superpowers/specs/2026-06-23-cpic-react-rebuild-design.md` — especially **Appendix A**
> (exact formulas, strings, quirks). Where a step says "per Appendix A §X", copy values verbatim.

**Goal:** Rebuild the static binary-search / BSTA / Bob teaching pages as a Vite + React + TS app
with a dramatic visual + animation glow-up, faithful to all existing pedagogy, deployed to Pages.

**Architecture:** Pure framework-free TS engines (`searchEngine`, `bstaEngine`, `bobEngine`) hold
all binary-search logic and are unit-tested; React hooks wrap them; components only render. Brand
tokens live in one CSS `@theme`. Motion drives the showpieces; reduced-motion gives calm fallbacks.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind v4, shadcn/ui (new-york, v4 path), Motion,
KaTeX, react-router (HashRouter), vite-plugin-singlefile, vitest.

## Global Constraints

- Faithful port — no new teaching features (spec Non-goals). Behavior matches Appendix A exactly.
- Palette = the existing **hex/sRGB** values copied verbatim from `index.html:8-53` (NOT OKLCH).
- Headings solid `--heading`; keep `--grad-heading` (top-nav underline only). No gradient text.
- Dark mode via **`@media (prefers-color-scheme)`** (Tailwind v4 `@custom-variant dark` → media),
  no `.dark` class, no theme toggle.
- Every showpiece has a `prefers-reduced-motion` fallback (instant/minimal fade).
- KaTeX: render inline `$...$` inside HTML strings via `renderMathInElement` on a ref after
  `dangerouslySetInnerHTML` (a `<RichText>` component); `import "katex/dist/katex.min.css"`.
- Single-file build: all routes statically imported, no lazy/dynamic import; inline KaTeX woff2.
- Verification: Playwright via `data:text/html;base64,<dist>` URL (no socket servers; `file://`
  blocked). Drive routes by clicking nav links.
- No `#000`/`#fff` literals in new code; use tokens. Animate transform/opacity (number-line
  marker exception per spec §4). Commit frequently.

---

### Task 1: Scaffold project + design tokens + build config

**Files:**
- Move first (executed in Step 0): `git mv index.html legacy/index.html` and
  `git mv bob-guess-game.html legacy/bob-guess-game.html` (the legacy root `index.html` would
  otherwise collide with Vite's own `index.html` app entry).
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` (app entry),
  `src/main.tsx`, `src/index.css`, `src/lib/cn.ts`, `components.json` (shadcn), `.gitignore`

**Interfaces:**
- Produces: a running `npm run dev`-less but `npm run build`-able app shell; `cn()` helper;
  CSS tokens (`--bg`, `--surface*`, `--text*`, `--accent*`, `--success`, `--danger`, `--warning`,
  `--highlight`, `--heading`, `--grad-accent`, `--grad-heading`) in dark + light.

- [ ] **Step 0 (vacate root):** `mkdir -p legacy && git mv index.html legacy/index.html &&
  git mv bob-guess-game.html legacy/bob-guess-game.html`, then commit. This must happen before
  scaffolding so Vite's own `index.html` entry can't collide with the legacy page.
- [ ] **Step 1:** `npm create vite@latest . -- --template react-ts` in a temp subdir, move the
  scaffolded files into repo root. Add deps:
  `npm i react-router-dom motion katex clsx tailwind-merge` and
  `npm i -D tailwindcss @tailwindcss/vite vite-plugin-singlefile vitest @types/katex jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom`.
- [ ] **Step 2:** `vite.config.ts` (import `defineConfig` from **`vitest/config`**): plugins
  `[react(), tailwindcss(), viteSingleFile()]`; `base: './'`;
  `build: { assetsInlineLimit: 100_000_000 }` (inline KaTeX fonts);
  `test: { environment: 'jsdom', globals: true }`. (Component/hook tests in Tasks 2/4/6/8 need
  the jsdom env; `@testing-library/*` provides `render`.)
- [ ] **Step 3:** `src/index.css`: `@import "tailwindcss";` then `@custom-variant dark (@media (prefers-color-scheme: dark));`
  then `@theme { ... }` with brand tokens (copy hex from `index.html:8-29`) and shadcn bridge
  tokens (`--color-background`, `--color-foreground`, `--color-primary`, `--color-card`,
  `--color-border`, `--color-ring`, `--color-muted`, `--color-muted-foreground`,
  `--color-destructive` mapped to brand values). Add a `@media (prefers-color-scheme: light)`
  block overriding the brand vars with the light hex from `index.html:32-53`. Port the body
  radial-gradient background + `prefers-reduced-motion` blanket reset from the current files.
- [ ] **Step 4:** `src/lib/cn.ts`: `export const cn = (...a) => twMerge(clsx(a))`.
- [ ] **Step 5:** `src/main.tsx`: `createRoot` → `<HashRouter><RootLayout/></HashRouter>` (RootLayout
  stub for now: renders `<Outlet/>`), `import "./index.css"`, `import "katex/dist/katex.min.css"`.
- [ ] **Step 6:** `npm run build` → expect success, `dist/index.html` self-contained. Commit.

---

### Task 2: KaTeX `<RichText>` + `<Math>` + motion tokens

**Files:**
- Create: `src/lib/math.tsx`, `src/lib/motion.ts`
- Test: `src/lib/math.test.tsx`

**Interfaces:**
- Produces:
  - `RichText({ html, as?, className? }): JSX` — sets `html` via `dangerouslySetInnerHTML`, runs
    `renderMathInElement(ref, KATEX_OPTS)` in `useLayoutEffect` on `[html]`.
  - `Math({ expr, display? }): JSX` — `katex.renderToString(expr, {displayMode, throwOnError:false})`.
  - `motion.ts`: `springs = { gentle, snappy, bounceless }`, `easeOutQuart`, `easeOutExpo`,
    `useCalmMotion()` (wraps `useReducedMotion()`), `variants` (fadeUp, pop, etc.).
  - `KATEX_OPTS` constant matching the current site's delimiters (`$$`,`$`,`\(`,`\[`).

- [ ] **Step 1:** Write `math.test.tsx`: render `<RichText html="x is $x^2$ <b>ok</b>"/>`, assert the
  container `innerHTML` contains a `.katex` element AND the literal `<b>ok</b>` survived.
- [ ] **Step 2:** Run `npx vitest run src/lib/math.test.tsx` → FAIL (module missing).
- [ ] **Step 3:** Implement `math.tsx` (RichText + Math + KATEX_OPTS) and `motion.ts` tokens.
- [ ] **Step 4:** Run vitest → PASS (use jsdom env; `katex` works in jsdom). Commit.

---

### Task 3: searchEngine + tests

**Files:**
- Create: `src/engines/searchEngine.ts`
- Test: `src/engines/searchEngine.test.ts`

**Interfaces:**
- Produces (consumed by Task 6 hook + Task 4 generic stepper):
  ```ts
  type Mode = 'search' | 'lower' | 'upper'
  type SearchState = { arr:number[]; mode:Mode; target:number; l:number; r:number; mid:number;
    ans:number; steps:number; finished:boolean; foundIdx:number; excluded:Set<number>;
    activeLine:number|null; statusHtml:string }
  function initSearch(arr:number[], mode:Mode, target:number): SearchState
  function stepSearch(s:SearchState): SearchState   // pure; idempotent at finished
  ```

- [ ] **Step 1:** Write tests asserting (per Appendix A "Binary search"): equality search on
  `[2,2,3,5,6,7,8]` target 3 → finds an index with value 3, `steps` small, `ans` stays -1;
  target 4 (miss) → `finished, foundIdx=-1`; lower_bound count of `<x` == index of first `>=x`;
  upper_bound `>x` logic; duplicates handled; `activeLine` set per branch; status HTML contains the
  not-found "(Some libraries return n = ...)" copy for lower/upper.
- [ ] **Step 2:** Run vitest → FAIL.
- [ ] **Step 3:** Implement `searchEngine.ts` porting `stepSearch`/`stepBound` from `index.html`
  (lines ~1160-1245) as pure reducers; status strings verbatim (interpolated).
- [ ] **Step 4:** Run vitest → PASS. Commit.

---

### Task 4: generic `useStepper` hook + tests

**Files:**
- Create: `src/hooks/useStepper.ts`
- Test: `src/hooks/useStepper.test.ts`

**Interfaces:**
- Produces: `useStepper<S>({ init:()=>S, step:(s:S)=>S, isFinished:(s:S)=>boolean })` →
  `{ state, step(), back(), reset(), play(), pause(), playing, canBack }`. History stack for
  `back()`; `play()` uses `setInterval` at a caller-provided delay; `step()`/manual cancels play.

- [ ] **Step 1:** Tests (React Testing Library + jsdom): step advances state & pushes history;
  back pops; reset clears history + re-inits; canBack reflects stack; play/pause toggles.
- [ ] **Step 2:** vitest → FAIL.
- [ ] **Step 3:** Implement hook (delay via a `speedRef`; clear interval on finish/unmount).
- [ ] **Step 4:** vitest → PASS. Commit.

---

### Task 5: bstaEngine + tests

**Files:**
- Create: `src/engines/bstaEngine.ts` (problem defs + step reducer)
- Test: `src/engines/bstaEngine.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type Dir = 'min'|'max'
  type BstaState = { l:number; r:number; mid:number; ans:number; steps:number; finished:boolean;
    lastCheck:boolean|null; activeLine:number|null; initialLo:number; initialHi:number;
    trueGoodLo:number|null; trueGoodHi:number|null; probed:Map<number,boolean>; statusHtml:string }
  const PROBLEMS: Record<'logs'|'ducks'|'custom', ProblemDef>
  function getCheck(problemKey, params): (x:number)=>boolean   // custom uses new Function
  function initBsta(problemKey, params): BstaState
  function stepBsta(problemKey, params, s): BstaState
  ```

- [ ] **Step 1:** Tests per Appendix A "BSTA": logs `[7,9,11]`,K=4 converges to the correct min x
  with `cuts=sum(ceil(a/x)-1)<=K`; ducks N=6,D=3 uses `r=max(N,1)`, `walk=N-D`, `walk<=0⇒true`,
  `sum(ceil(i/x))<=D`; custom `return x*x>=50` min over [1,100] converges to 8 (since 7²=49<50,
  8²=64≥50); direction min ⇒ on good `r=mid-1`, max ⇒ `l=mid+1`; good-region anchoring
  (min suffix from smallest probed-true to hi; max prefix lo to largest probed-true);
  custom non-boolean return → error string.
- [ ] **Step 2:** vitest → FAIL.
- [ ] **Step 3:** Implement porting PROBLEMS + `step()` from `index.html` (lines ~1335-1500,
  1850-1930). Keep `checkTrace` strings, `new Function` smoke-test + error copy verbatim.
- [ ] **Step 4:** vitest → PASS. Commit.

---

### Task 6: bobEngine + tests

**Files:**
- Create: `src/engines/bobEngine.ts`
- Test: `src/engines/bobEngine.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type BobState = { target:number; lo:number; hi:number; guessCount:number; gameOver:boolean;
    marks:{value:number,latest:boolean}[]; bobFace:string; youFace:string; bubbleYou:string;
    bubbleBob:{text:string,kind:'normal'|'found'|'invalid'}; rangeLabel:string; hintHtml:string|null }
  function newGame(prev?:BobState): BobState                  // first game target 67, else random
  function guess(s:BobState, raw:string): BobState            // pure; validation + honest answer
  function optimalHint(count:number): string                 // 3-tier copy
  ```

- [ ] **Step 1:** Tests per Appendix A "Bob": first `newGame()` target===67; guess>target ⇒
  bubble "Lower!" and count increments; guess<target ⇒ "Higher!"; out-of-range guess still
  answered+counted but range unchanged when outside `[lo,hi]`; in-range narrows `lo=guess+1` /
  `hi=guess-1`; empty ⇒ "Type a number first!" (no count); non-int/oob ⇒ "It has to be 0-100,
  integer." (no count); win sets face 🤯 if count≤7 else 😅; face escalation uses post-increment
  count `BOB_FACES[min(7,floor(count*1.2))]` on non-win; 3-tier hint thresholds.
- [ ] **Step 2:** vitest → FAIL.
- [ ] **Step 3:** Implement porting `makeGuess`/`newGame`/`showHint` from `bob-guess-game.html`.
  Inject RNG as a param defaulting to `Math.random` so tests seed it.
- [ ] **Step 4:** vitest → PASS. Commit.

---

### Task 7: RootLayout + AmbientBackground + TopNav + routing/transitions

**Files:**
- Create: `src/components/layout/RootLayout.tsx`, `AmbientBackground.tsx`, `TopNav.tsx`
- Modify: `src/main.tsx` (route table)

**Interfaces:**
- Consumes: motion tokens. Produces: route shell with `/` (SearchPage), `/bob` (BobPage) and
  animated `<AnimatePresence>` outlet transitions keyed by `location.pathname`.

- [ ] **Step 1:** `AmbientBackground`: 4-5 absolutely-positioned radial-gradient blobs drifting via
  CSS `@keyframes` transform/opacity (frozen under reduced-motion); subtle pointer parallax
  (disabled under reduced-motion). GPU-only props.
- [ ] **Step 2:** `TopNav`: brand wordmark in solid `--heading`; nav links (Binary search / BSTA
  tabs handled in SearchPage; "Bob's guessing game" → `/bob`). Active link uses `--grad-heading`
  underline. shadcn-styled.
- [ ] **Step 3:** `RootLayout`: `<AmbientBackground/>` + `<TopNav/>` + `<AnimatePresence mode="wait">`
  around `<Outlet/>` with directional fade/slide; `main.tsx` routes wired (static imports).
- [ ] **Step 4:** `npm run build`; Playwright `data:`-URL load; screenshot home; click to `/bob`;
  confirm transition + background render. Commit.

---

### Task 8: Surfaces — SearchPage (2 tabs) + BobPage

**Files:**
- Create: `src/pages/SearchPage.tsx`, `src/pages/BobPage.tsx`,
  `src/components/viz/{ArrayTrack,NumberLine,MonotonicityCurve,CodePanel,StatChips,StatusBar,Characters}.tsx`
- Create shadcn ui: `button, tabs, slider, select, input, switch, tooltip` (vendored, bridged tokens).

**Interfaces:**
- Consumes: engines (Task 3/5/6), `useStepper` (Task 4), `RichText`/`Math` (Task 2), tokens.
- Produces: the three fully interactive surfaces.

- [ ] **Step 1 (Binary search tab):** array input (auto-sort, Random 10-20/1-15, max 40, exact
  hint strings per Appendix A), mode toggle (Tabs/Segmented) with verbatim CODE_TEMPLATES + STL +
  MODE_DESCS via `RichText`, target input, Start/Step/Back/Reset, speed Slider, keyboard (route-
  scoped guards per Appendix A; Enter scoped to array input). `ArrayTrack` = wrapping flex row,
  per-slot color/opacity/scale (no layout reflow), mid pulse, answer bloom, `[l,r]` glide overlay
  per-row. `StatChips {l,mid,r,ans,steps}`. `StatusBar` via `RichText`.
- [ ] **Step 2 (BSTA tab):** problem toggle (logs/ducks/custom), params grid, Custom textarea +
  `new Function` errors, live `CodePanel` with active-line highlight, `MonotonicityCurve` (SVG,
  3 column states, 200-col stride, draw-on, "Show all results" Switch), `NumberLine` (SVG markers
  glide; `ans` `✓`-prefix/reposition per Appendix A), check() trace list, `StatChips
  {l,mid,r,ans,check(mid)}`, controls + speed.
- [ ] **Step 3 (Bob page):** `Characters` (You/Bob faces + spring speech bubbles, mobile edge-anchor
  fix from the polish pass), `NumberLine` range bar snapping shut, guess input + New game, stats
  (exact labels, in-place "You won in"), 3-tier hint, victory showpiece (bloom/pulse/snap/confetti
  with reduced-motion static fallback).
- [ ] **Step 4:** `npm run build`; Playwright `data:`-URL verification: step search to completion;
  run a BSTA search + toggle reveal; play Bob to a win; screenshot dark + light + 375px each.
  Fix visual issues. Commit.

---

### Task 9: CI workflow + legacy cutover + final verification + merge

**Files:**
- Create: `.github/workflows/deploy.yml`
- Note: legacy `index.html`/`bob-guess-game.html` were already `git mv`d to `legacy/` in Task 1.
- Create: optional `legacy/` redirect stubs from old paths to the new hash routes.
- Modify: README note pointing to `legacy/`.

**Interfaces:** Produces a deployable repo on `main`.

- [ ] **Step 1:** `deploy.yml`: triggers `push: branches:[main]` + `workflow_dispatch`; jobs:
  `actions/checkout`, setup-node, `npm ci`, `npm run build`, `actions/upload-pages-artifact`
  (`dist`), `actions/deploy-pages`. Permissions `pages: write`, `id-token: write`.
- [ ] **Step 2:** Confirm `legacy/index.html` + `legacy/bob-guess-game.html` exist (moved in Task 1)
  and are reachable on Pages; add optional redirect stubs from old paths to the new hash routes.
- [ ] **Step 3:** Full gate: `tsc --noEmit`, `npm run build`, `npx vitest run` (all green),
  Playwright `data:`-URL screenshots of all three surfaces dark/light/375px.
- [ ] **Step 4:** Commit; push `react-rebuild`; open PR (or merge to `main` per user). After merge,
  enable Pages → GitHub Actions source; confirm the workflow deploys.

---

## Self-Review

- **Spec coverage:** Stack→T1; KaTeX/motion→T2; engines→T3/5/6; stepper→T4; layout/ambient/
  transitions→T7; three surfaces incl. all showpieces + Appendix-A fidelity→T8; deploy/legacy/
  verification→T9. Reduced-motion threaded through T1 (blanket) + T7/T8 (per-showpiece). ✓
- **Placeholders:** none — exact values deferred to spec Appendix A by explicit reference. ✓
- **Type consistency:** `SearchState`/`BstaState`/`BobState` defined once (T3/5/6) and consumed by
  `useStepper` (T4) and pages (T8); `RichText`/`Math` signatures fixed in T2. ✓

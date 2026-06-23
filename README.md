# Binary Search · visualized

Interactive teaching visualizations for the CPIC binary-search lecture, rebuilt as a
React app with a living aurora aesthetic and cinematic, reduced-motion-aware animations.

Three surfaces:

- **Binary search** — equality search, `lower_bound`, and `upper_bound` over a sorted array,
  with the exact CPIC code templates, STL shortcuts, step/back/auto-play, and keyboard control.
- **Binary search the answer** — log cutting, duck transport, and a custom `check(x)`, with a
  live monotonicity curve, an animated number line, and a per-step `check()` trace.
- **Bob's guessing game** — guess Bob's score; the possible-range bar narrows as you play.

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # vitest (pure engine + lib specs)
npm run build      # typecheck + single-file production build -> dist/index.html
```

## Architecture

- **Vite + React + TypeScript + Tailwind v4**, animated with **Motion**, math via **KaTeX**.
- Pure, framework-free engines in `src/engines/` (`searchEngine`, `bstaEngine`, `bobEngine`)
  hold all binary-search logic and are unit-tested; React hooks wrap them, components only render.
- Single-file build (`vite-plugin-singlefile`) with KaTeX fonts inlined — the whole app ships as
  one self-contained `index.html`.

## Deployment

Pushed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

The original zero-dependency static pages are preserved under [`legacy/`](legacy/) and remain
reachable on the deployed site at `/legacy/index.html` and `/legacy/bob-guess-game.html`.

See [`docs/superpowers/specs`](docs/superpowers/specs) and
[`docs/superpowers/plans`](docs/superpowers/plans) for the design spec and implementation plan.

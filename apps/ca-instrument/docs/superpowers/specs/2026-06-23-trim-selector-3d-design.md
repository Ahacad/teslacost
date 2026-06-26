# Trim selector + 3D "your car" focus panel — design

- **Date:** 2026-06-23
- **Status:** Approved (design); pending implementation plan
- **Topic:** Reframe the page around a user-selected trim, fronted by a low-poly 3D car

## Goal

Today the page is lineup-wide: the hero headline is the single cheapest car across
all trims. But a visitor usually arrives wanting *one* car — "what does a Model Y
Performance actually cost me?" — and has to hunt the table for it. This feature makes
a **selected trim** the star: pick model + trim, see a spinnable low-poly 3D car, and
the finance / lease / cash numbers for that trim beside it. The full table and charts
stay as lineup context, with the selected trim highlighted.

Non-goal: changing any cost math. The validated `src/domain/` engine and its golden
tests are untouched; this is a presentation/state layer on top.

## Background — current state

- `src/ui/components/Hero.tsx` computes the lineup-lowest all-in across every trim ×
  {finance, lease}. There is **no selected-vehicle concept** anywhere in state.
- `src/state/settings.ts` holds market / tax / down / toggles and derives `scenarios`
  (every vehicle's full breakdown) plus a `scenarioByKey(key)` helper — already present
  and reused below.
- Stack: Preact 10 + `@preact/preset-vite` + Vite + TS + `@preact/signals`. **No React
  in the tree** — this rules out some 3D libraries (see Decisions).

## Decisions (with rationale)

### D1 — Refocus scope: dedicated "your car" panel (not full-page filter)
Selecting a trim drives a rich single-car focus panel that replaces the hero. The table
and charts below stay full-lineup (the cross-trim comparison is the tool's main value),
but the selected row is highlighted and clickable. Chosen over "refocus headline only"
(too thin) and "filter the whole page" (destroys the comparison).

### D2 — 3D engine: Google `<model-viewer>`
Verified against live docs (2026-06-23):
- **71 KB gzip, self-contained** (inlines its own three.js) — the smallest realtime-3D
  option. Raw three.js core alone is ~178 KB gzip *before* loaders/controls.
- **Web component** → Preact renders one tag, no framework coupling.
- Everything needed is a built-in attribute: `loading="lazy"`, `poster`,
  `reveal="interaction"`, `camera-controls`, `auto-rotate`, plus one-tap AR.
- Apache-2.0, Google-maintained.

**Rejected:** react-three-fiber/drei (it's a React *renderer* bound to React's
reconciler; `preact/compat` doesn't provide those internals — would force all of React
into the app); Spline (548 KB gzip runtime + reported CPU pegging, hosted-editor
lock-in); raw three.js (heavier than model-viewer *and* more hand-written code for less).

### D3 — Asset style: low-poly stylized, both models, asset-swappable
- Matches what the user judged "okay" when spinning real candidates.
- Tiny + fast, visually consistent across models, easiest to modify, and lowest
  trademark/trade-dress exposure (clearly an abstraction).
- **Asset-agnostic:** `CarViewer` loads a GLB *URL per vehicle from data*, so any single
  car can be swapped for a higher-fidelity GLB later with zero code change (e.g. drop the
  CC-BY Model 3 2024 "Highland" mesh into the Model 3 slot).

### D4 — Asset sourcing + licensing reality (from research)
- **Free Model 3:** a clean CC-BY low-poly exists (4.3k tris, separate wheels).
- **Free Model Y:** the only CC-BY mesh is 2.4M tris (8× over web budget); all
  web-weight Model Ys are NonCommercial. Low-poly path sidesteps this — a low-poly SUV
  is easy to source/make/decimate.
- **Paid marketplaces:** almost every Tesla-badged paid model is **"Editorial use only"**
  (no product use), and even "Royalty Free" ones grant the mesh but **not** Tesla's
  trademark. A clean commercially-licensed *Tesla-badged* model effectively doesn't exist
  for sale.
- **Posture for this project:** personal/educational cost tool on GitHub Pages, using a
  *free CC-BY* asset to depict the very car being costed (descriptive/nominative use).
  Mitigations: CC-BY attribution + a "not affiliated with Tesla" disclaimer in the footer;
  de-badge the mesh if it carries a logo. Not legal advice; revisit if it ever goes
  commercial.

## Detailed design

### State — `src/state/settings.ts`
```
export const selectedVehicleKey = signal(DEFAULT_MARKET.vehicles[0].key);
export const selectedScenario = computed(() => scenarioByKey(selectedVehicleKey.value));
// in setMarket(): selectedVehicleKey.value = m.vehicles[0].key;
```
`selectedScenario` reuses `scenarioByKey`, so it inherits every live dial (tax, down,
toggles, FX). No domain math changes.

### Data — `src/domain/types.ts` + new `src/data/models3d.ts`
- Optional per-trim override on `Vehicle`: `glb?: string; poster?: string`.
- `src/data/models3d.ts`: `MODEL_ASSETS: Record<string, { glb: string; poster: string }>`
  keyed by model family (`'Model 3'`, `'Model Y'`) + `assetFor(vehicle)` resolving
  trim-override → family default.
- Assets in `public/models/` (`*.glb` + poster `*.webp`).

### Components — new, `src/ui/components/`
- **`TrimSelector.tsx`** — segmented model toggle + trim chips, bound to
  `selectedVehicleKey`.
- **`CarViewer.tsx`** — wraps `<model-viewer>`. Dynamic `import('@google/model-viewer')`
  on first intersection (own Vite chunk; never blocks first paint). Props `src`, `poster`,
  `paintHex`, `autoRotate`. Renders the poster `<img>` immediately; recolors the body
  material in an effect when `paintHex` changes; honors `prefers-reduced-motion`
  (no auto-rotate, poster until interaction); static-image fallback on WebGL/script
  failure.
- **`CarFocus.tsx`** — the "your car" panel: `TrimSelector` + `CarViewer` + a cost
  summary from `selectedScenario` (finance / lease / cash monthly, upfront, 8-yr net) +
  paint swatches driving `paintHex` (visual only, no cost effect).

### Integration — `src/ui/App.tsx`, `src/ui/components/ScenarioTable.tsx`
- Replace `<Hero/>` with `<CarFocus/>`; keep `<Takeaways/>` (lineup-lowest is now
  complementary context, not the headline).
- `ScenarioTable`: highlight the row where `s.vehicle.key === selectedVehicleKey`, and a
  row click sets `selectedVehicleKey` — bidirectional link between table and hero.

### Legal — `src/ui/components/Footer.tsx`
CC-BY attribution line(s) for the mesh author(s) + "Not affiliated with or endorsed by
Tesla, Inc."

### Testing
- Unit: `selectedScenario` tracks `selectedVehicleKey` and resets on `setMarket`;
  `assetFor()` resolution (trim override → family default).
- The web component is manual/visual (not meaningfully unit-testable); keep all logic in
  pure functions, the component stays thin.

## Scope

**In v1:** selected-trim state; `TrimSelector`; `CarFocus` with `CarViewer` (lazy +
poster + reduced-motion + fallback) and the selected-trim cost summary; live paint
recolor + swatches; table row highlight + click-to-select; footer attribution/disclaimer;
low-poly Model 3 + Model Y assets (de-badged) with posters.

**Deferred (YAGNI):** per-trim wheel swaps, chart highlighting of the selected trim, AR
mode (nearly free via model-viewer but needs USDZ), multi-colour persistence.

## Risks / open items
- **Model Y asset:** no clean free low-poly identified yet — source, make, or decimate;
  fallback is a generic low-poly SUV. Tracked as an asset task in the plan.
- **Paint recolor** depends on the body being its own material in the GLB; if not, a
  one-time Blender split. Verify per asset.
- **Bundle:** +71 KB gzip (lazy chunk) + low-poly GLB bytes; nothing on the critical path.

## Success criteria
- A visitor can pick any model+trim and see its 3D car + its finance/lease/cash numbers
  without scanning the table.
- First paint is unaffected (3D lazy-loads behind a poster); reduced-motion and
  WebGL-failure both degrade to a static image.
- Cost numbers for the selected trim match the table row exactly (same engine).
- `npm test` green (new state/resolver tests + existing golden tests), `npm run build`
  clean.

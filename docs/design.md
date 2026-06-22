# Design — TypeScript refactor of the Tesla CA dashboard

**Date:** 2026-06-22 · **Status:** implemented

## Goal

Refactor the single 661-line `tesla_dashboard.html` into a maintainable TypeScript
npm project, built TDD, with clean seams for later extension (more currencies,
more models/trims, more provinces).

## Decisions

| Question | Choice | Why |
|---|---|---|
| Build output | standard Vite `dist/` bundle | no single-file constraint requested |
| UI layer | Preact + `@preact/signals` | whole page is derived state; signals replace manual re-render orchestration; smallest delta from the imperative original; best test story |
| Scope | pure refactor | build the extension seams, don't wire new currencies/models yet (YAGNI) |
| Test runner | Vitest | pairs with Vite; jsdom for components, node for pure domain |
| Toolchain | nix `nodejs_24` | no `node` on PATH; Windows `node.exe` mis-resolves WSL paths |

## Architecture

Three layers with a strict dependency direction `ui → state → domain` and
`state/ui → data`:

- **`domain/`** — pure functions + types. `finance`, `lease`, `cash`, `currency`,
  `scenario` (composes the per-method `MethodResult`s), `cumulative` (line-chart
  series). No DOM, no framework, no `data` import. The entire TDD surface.
- **`data/`** — declarative tables: `vehicles`, `costs`, `tax`, `currencies`,
  `config`. Editing these extends the app; they contain no logic.
- **`state/`** — `@preact/signals`. Raw UI signals (province, down, currency, FX,
  toggles) feed `settingsFor(vehicle)`, and a `computed` `scenarios` derives every
  vehicle's breakdown. `format.ts` exposes a reactive `money()`.
- **`ui/`** — one Preact component per section, plus reusable `BarChart` /
  `LineChart` SVG components and a signal-driven `Tooltip`.

## Data flow

`signals → computed(scenarios) → components`. A dial change propagates through the
computed to only the components that read it. Charts take base-currency values for
geometry and format labels through `money()`, so a currency switch reformats
without recomputing the model.

## Invariants locked by tests

- Finance reproduces tesla.com to the dollar ($479 / $613 / $929 / $602 pre-tax).
- Money factor is `APR / 2400` (the double-divide-by-100 bug is explicitly tested
  against).
- Lease taxes payments, not the residual; finance rolls tax into principal.
- Currency round-trip identity `toBase(convert(n)) === n`.
- Cumulative: cash flat after the upfront step, finance monotone, lease steps up at
  each re-lease, and lease@96 equals its 8-year net.

## Preserved from the original

The validated equations (ported verbatim), the editorial visual design (CSS moved
to `styles/app.css` unchanged), live FX with offline fallback, and the "lease est"
caveat on Model Y. Verified by headless-screenshot against the original render:
identical layout and to-the-dollar numbers (hero `$833/mo`).

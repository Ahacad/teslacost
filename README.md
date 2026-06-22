# Tesla Canada — Cost Instrument

An interactive dashboard for what a Tesla Model 3 / Model Y **actually costs** in
Canada: financed, leased, or paid in cash, with running costs, FSD, multi-currency
display, and live charts. The finance/lease math reproduces tesla.com's own
"finplat" engine to the dollar.

Rebuilt from a single 661-line HTML file into a typed, tested, extensible project.

## Quick start

```sh
npm install
npm run dev       # dev server with HMR
npm run build     # typecheck + production bundle to dist/
npm test          # run the test suite
npm run test:watch
```

> **This machine (WSL2/NixOS):** there is no `node` on `PATH`. Prefix commands with
> `nix-shell -p nodejs_24 --run '…'`, e.g. `nix-shell -p nodejs_24 --run 'npm test'`.

## Architecture

Three layers, one rule: **the math never touches the DOM.**

```
src/
  domain/     pure, framework-free — finance, lease, cash, currency, scenario, cumulative
  data/       declarative tables   — vehicles, costs, tax, currencies, config
  state/      @preact/signals       — settings → computed scenarios, FX, formatting
  ui/         Preact components      — sections + reusable SVG charts
```

- **domain** has no imports from `data`, `state`, or `ui`. It is the entire TDD
  surface and is locked by the tesla.com golden numbers (see `test/domain/`).
- **data** is what you edit to extend the app (see below). No logic.
- **state** wires settings signals to the pure domain; `scenarios` is a `computed`
  that recomputes when any dial moves. Components subscribe and re-render.
- **ui** is presentation only. Charts (`BarChart`, `LineChart`) are data-driven
  and currency-agnostic — heights come from base-currency values, labels are
  formatted through the reactive `money()` helper.

## Extending

- **Add a trim/model:** append one entry to `src/data/vehicles.ts`. If it's a new
  model family, add its running costs to `src/data/costs.ts`.
- **Add a currency:** append to `src/data/currencies.ts` (code, symbol, locale).
  Rates come from the live `open.er-api.com` feed (every ISO code) or the baked
  `FALLBACK_RATES`.
- **Add a province / change rates:** `src/data/tax.ts` and `src/data/config.ts`.

No `domain/` or `ui/` changes needed for any of the above.

## Testing

`npm test` runs Vitest. Domain tests are pure (node); component tests opt into
jsdom with a `// @vitest-environment jsdom` pragma. The domain suite encodes
Tesla's published figures as a regression lock: finance matches to the dollar;
the M3 RWD lease lands within ~$3 of tesla.com's shown payment (documented in
`test/domain/lease.test.ts`).

## Provenance

Numbers are a snapshot of tesla.com/en_ca, 2026-06-21 (CAD). Insurance, charging,
resale %, and the Model Y lease residuals are overridable estimates — flagged in
the UI. See `tesla_other_costs.md` and `tesla_scenarios.md` for the line-item
sources.

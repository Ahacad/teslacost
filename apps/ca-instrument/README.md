# Tesla — Cost Instrument

**Live:** <https://ahacad.github.io/teslacost/> — deployed from `master` by GitHub Actions.

An interactive dashboard for what a Tesla Model 3 / Model Y **actually costs** —
financed, leased, or paid in cash — with running costs, FSD, multi-currency
display, and live charts. Switch markets (🇨🇦 Canada · 🇺🇸 United States) from the
top tab strip; each is a self-contained dataset. The finance/lease math reproduces
tesla.com's own "finplat" engine to the dollar.

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
    markets/  one file per market  — ca (Canada/CAD) · us (United States/USD)
  state/      @preact/signals       — market + settings → computed scenarios, FX, formatting
  ui/         Preact components      — market tabs + sections + reusable SVG charts
```

Each **market** (Canada, US) is a self-contained dataset — its own lineup, fees,
finance/lease terms, tax regions, and base currency. The top tab strip switches
markets; everything recomputes. Per-trim US data (each trim's current finance APR
+ promo and its lease money factor + residual) reproduces tesla.com/en_us to the
dollar.

- **domain** has no imports from `data`, `state`, or `ui`. It is the entire TDD
  surface and is locked by the tesla.com golden numbers (see `test/domain/`).
- **data** is what you edit to extend the app (see below). No logic.
- **state** wires settings signals to the pure domain; `scenarios` is a `computed`
  that recomputes when any dial moves. Components subscribe and re-render.
- **ui** is presentation only. Charts (`BarChart`, `LineChart`) are data-driven
  and currency-agnostic — heights come from base-currency values, labels are
  formatted through the reactive `money()` helper.

## Extending

- **Add a market:** one new file under `src/data/markets/` (its vehicles, config,
  tax regions, base currency) + one entry in `src/data/markets/index.ts`. The tab
  strip, masthead, controls, and copy all follow it. Nothing in `domain/`, `state/`,
  or `ui/` changes.
- **Add a trim/model:** append one entry to a market's vehicle list. CA trims use
  the market's finance/lease config; US trims carry their own per-trim APR/term and
  lease money factor. New model family → add its running costs.
- **Add a currency:** append to `src/data/currencies.ts` (code, symbol, locale).
  Rates come from the live `open.er-api.com` feed (every ISO code) or the baked
  `FALLBACK_RATES`; markets cross-rate through their base currency automatically.
- **Add a province/state or change rates:** the market's `taxRegions` + `config`.

No `domain/` or `ui/` changes needed for any of the above.

## Testing

`npm test` runs Vitest. Domain tests are pure (node); component tests opt into
jsdom with a `// @vitest-environment jsdom` pragma. The domain suite encodes
Tesla's published figures as a regression lock: finance matches to the dollar;
the M3 RWD lease lands within ~$3 of tesla.com's shown payment (documented in
`test/domain/lease.test.ts`).

## Provenance

- **Canada:** tesla.com/en_ca, 2026-06-21 (CAD). Model Y lease residuals are
  estimates, flagged "lease est". See `reference/tesla_scenarios.md` and
  `reference/tesla_other_costs.md`.
- **United States:** tesla.com/en_us, 2026-06-22 (USD). Every finance and lease
  payment reproduces Tesla to the dollar; no federal EV credit (IRA 30D ended
  Sept 2025). See `reference/tesla_us_data_2026-06-22.md`.

Insurance, charging, and resale % are overridable estimates in both markets.

## Layout

```
src/         application (domain · data/markets · state · ui)
test/        Vitest suites (domain incl. US goldens + ui)
docs/        design.md
reference/   captured Tesla data + notes (CA 2026-06-21 · US 2026-06-22)
legacy/      the original single-file dashboard, kept for reference
dist/        build output (gitignored)
```

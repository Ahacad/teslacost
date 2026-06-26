# Re-pulling Tesla pricing — data-sourcing runbook

The numbers that drive this calculator (`src/data/`) are a **dated snapshot** of
tesla.com. Tesla changes base prices, promo APRs, and lease money factors often,
so every figure carries a capture date and the rule is **re-pull live, don't
trust a stale snapshot** ([[prefer-real-current-data-over-inferred]]). This file
is the end-to-end recipe for that re-pull: how to get past the bot wall, where
each number lives on the page, how to map it into our schema, and how to prove
it's right.

Companion files: `tesla_finance_notes.md` (CA capture), `tesla_us_data_2026-06-22.md`
(US capture), and the reusable driver skeleton `scripts/tesla-cdp-pull.mjs`.

---

## 0. The wall: why you can't just `curl`

tesla.com sits behind **Akamai bot protection**. `WebFetch`, `curl`, and even
**headless** Chrome get **403 / "Access Denied"** (look for an `edgesuite.net`
referrer) — their TLS+JS fingerprint fails the check. The only thing that
reliably passes is a **real, headful Chrome** driven over the **DevTools
Protocol (CDP)**. Mechanism details and platform notes:
[[cdp-fetch-bot-protected-sites]] and [[wsl-windows-tooling]].

## 1. Launch a throwaway headful Chrome

From WSL, launch Windows Chrome with remote debugging on a **fresh throwaway
profile** (your real browser stays untouched; the solved Akamai cookie persists
in this profile for the session):

```
chrome.exe --remote-debugging-port=9222 \
  --user-data-dir="C:\Windows\Temp\tesla-cdp" \
  --no-first-run --no-default-browser-check about:blank
```

The window can sit onscreen — keep it onscreen, offscreen hurts the Akamai
sensor.

## 2. Drive it over CDP (zero-dependency node.exe)

Connect a Windows `node.exe` script (Node 22+ for global `WebSocket`) — no
puppeteer, no npm. The flow: `fetch('http://127.0.0.1:9222/json/list')` → open a
`WebSocket` to the page target's `webSocketDebuggerUrl` → send raw CDP
(`Page.navigate`, `Runtime.evaluate`, `Network.enable`, `Input.dispatchMouseEvent`,
`Page.captureScreenshot`). `scripts/tesla-cdp-pull.mjs` is a working skeleton of
exactly this — start there.

## 3. Get onto the design page (and clear the overlays)

Navigate to the trim configurator ("design") page per model/market:

- CA: `https://www.tesla.com/en_ca/model3/design`, `.../modely/design`
- US: `https://www.tesla.com/en_us/model3/design`, `.../modely/design`

Then, **before reading anything**:

- **Akamai press-and-hold challenge** (`#sec-if-cpt-container`, "Powered by
  Akamai"): inject mouse `mouseMoved` events to feed the sensor and poll until
  `document.title` becomes the real page title. Bring the window onscreen first
  (`Browser.setWindowBounds`).
- **Cookie banner + region/language overlay**: dismiss them or they cover the
  page. Tell: `document.body.innerText` is full of country names → the overlay is
  still open.
- Real React/custom controls **ignore `el.click()`** — dispatch a genuine
  `Input.dispatchMouseEvent` press+release at the element's
  `getBoundingClientRect()` center.

## 4. Where each number lives

Two sources, used together:

**(a) Embedded `dataJson` bootstrap** — the page ships pricing config as a
`const dataJson = {…}` inside a `<script>`. Grab that element's `textContent`,
brace-match from the first `{` (string-aware), and **`eval`** it — it's JS, not
strict JSON (trailing commas, so `JSON.parse` fails). Keys are **dot-flattened**,
not nested:

- `data.DSServices['Lexicon.m3']` — trim option catalog + prices. Trim cash price
  = base option `$MDLx` price **+** the selected trim-delta option (`$MTxxx`).
- `data.DSServices['Fees.m3.m3']` — destination/freight + order fees.
- `data.DSServices['Lease.m3.m3']`, `['Loan.m3.m3']` — **empty inside `dataJson`.**
  The real per-trim finance/lease *products* (money factor, residual rate,
  interest rate by term×mileage) live in the script's **code tail after** the
  object, not in the bootstrap.

**(b) Rendered Finance / Lease tabs** — because (a) omits the products, read the
per-trim terms off the UI: click each trim card, switch Finance vs Lease, and
read the summary line.

- Finance summary: `X% APR, $Y down, Z mo` → `finance.apr`, `financeDown`,
  `finance.termMonths`.
- Lease: the residual (dollars) and money factor; mileage/term defaults. The MF
  may only appear in the code tail — back it out from the monthly if needed
  (§6).

**Both quoted payments are pre-sales-tax** — Tesla layers provincial/state tax at
checkout. Verify by reproducing the monthly with zero tax (§6).

## 5. Map onto our schema (`src/domain/types.ts`)

Per trim → a `Vehicle` row (`src/data/vehicles.ts` for CA, `markets/us.ts` for US):

| Schema field | Source | Notes |
|---|---|---|
| `base` | `Lexicon` base + trim-delta option | cash price **before** fees |
| `financeDown` | Finance tab "$Y down" | |
| `finance?` `{apr, termMonths}` | Finance tab | **per-trim** for US (promos differ by trim); **omit** for CA (uses market `config.finance`) |
| `residual` | Lease tab, dollars | exact; overrides `residualPct`. Set `residualConfirmed: true` |
| `residualPct` | residual ÷ basis | fallback when residual not read; mark `residualConfirmed: false` |
| `moneyFactor?` | Lease product / code tail | **per-trim** for US; omit for CA (derived `apr/2400`) |

Market-wide → `CostConfig` (`src/data/config.ts` CA, inline in `markets/us.ts`):

| Field | CA | US |
|---|---|---|
| `fees` | $2,642 freight/PDI+levies, rolled into price | $1,390 destination, rolled in |
| `orderFee` | 0 | $250, separate upfront |
| `finance` | market default `5.03% / 96mo` | fallback only; each trim carries its own |
| `lease` | `4.9272% / 48mo / $5,000 / 16,000 km` | `~5% / 36mo / $3,000 / 10,000 mi` |
| `taxInFinancedPrincipal` | **true** (CA finances tax into the loan) | **false** (US quotes pre-tax, tax paid upfront) |
| `residualBasis` | `'base'` | `'priceWithFees'` |
| `distanceUnit` | `'km'` | `'mi'` |

Tax regions → `TaxRegion[]` (`src/data/tax.ts` CA, inline US). Flat `rate`, or a
price-tiered `rateFor(priceWithFees)` for luxury surtaxes (BC PST bands).

## 6. Verify to the dollar (non-negotiable)

A pull isn't done until **every** finance and lease monthly reproduces tesla.com
**exactly** from the listed inputs. The math is client-side, so these equations
*are* Tesla's:

```
Finance (amortization):   P = base + fees − down;  i = APR/12
                          M = P · i / (1 − (1+i)^−n)

Lease (depreciation+rent): adjCap = base + fees − down
                          MF = APR/2400              (percent → factor)
                          M  = (adjCap − residual)/n + (adjCap + residual)·MF
```

Reproduce each monthly with **zero tax** (confirms quotes are pre-tax). Then lock
the verified numbers with golden tests under `test/domain/` so a future edit that
breaks them fails loudly. If a figure is an estimate (e.g. a residual back-solved
rather than read directly, or a tab that never activated), flag it:
`residualConfirmed: false` → "lease est" in the UI. Don't pass an estimate off as
confirmed.

## 7. Update checklist

1. Re-pull per the above; capture raw output under `reference/` with a dated
   filename (mirror `tesla_us_data_2026-06-22.md`).
2. Edit `src/data/vehicles.ts` / `markets/us.ts` / `config.ts` / `tax.ts`. Update
   the **capture-date comment** at the top of each file you touch.
3. `npm test` — golden tests must pass (update them only when Tesla genuinely
   changed, and say so in the commit).
4. `npm run build` to typecheck + bundle.
5. Commit (Conventional Commits; note the new capture date and what moved).

Run tooling via nix node — see [[wsl-windows-tooling]].

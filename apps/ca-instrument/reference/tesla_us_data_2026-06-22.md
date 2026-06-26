# Tesla US — pricing snapshot (2026-06-22)

**Source:** tesla.com/en_us, read live via headful Chrome over the DevTools Protocol
(curl/WebFetch are Akamai-blocked). Cash/trim prices, fees, and the lease
residual/money-factor schedule come from the page's embedded `dataJson` bootstrap;
per-trim finance APR/term/down were read off the rendered Finance tab by selecting
each trim. All amounts **USD**.

**Verification:** every finance and lease payment below reproduces tesla.com **to the
dollar** from the listed inputs — finance by loan amortization, lease by
depreciation+rent. Quoted payments **exclude sales tax** (verified: payments match
with zero tax), so tax is layered on separately by the dashboard's state selector.

## Fees (both models)
- **Destination Fee: $1,390** — included in the amount financed / cash out-the-door.
- **Order Fee: $250** — separate non-refundable upfront; not financed.

## Federal incentive
- **No federal EV tax credit** anywhere — absent from the bootstrap (`federal`,
  `7500`, `tax credit` not present) and not rendered. Consistent with IRA 30D ending
  ~Sept 30 2025. Only Tesla's own "Up to $X potential savings after delivery" promos
  exist (vary by pay method; not modeled as a credit).

## Finance model
`principal = cashPrice + 1390 destination − down`; amortize at the trim's APR over its
term; **pre-sales-tax**. Down/term/APR are the values Tesla currently shows per trim
(promos included — these are live and change).

## Lease model
36 mo · 10,000 mi/yr · $3,000 down. `residual = residualRate × (cashPrice + 1390)`;
`adjCap = cashPrice + 1390 − down`; `monthly = (adjCap − residual)/term + (adjCap +
residual) × moneyFactor`; **pre-sales-tax**. Money factor → APR: `apr = MF × 2400`.
Residual rate + money factor are **per trim** (Tesla's published schedule).

## Model 3 — 4 trims

| Trim | Cash | Finance APR / term / down | Fin $/mo | Lease resid% / MF | Lease $/mo |
|------|-----:|---------------------------|---------:|-------------------|-----------:|
| Standard RWD     | $36,990 | 6.57% / 84mo / $3,450 | $521 | 62% / 0.00012 | $329 |
| Premium RWD      | $42,490 | 0.99% / 72mo / $3,250 | $582 | 65% / 0.00008 | $349 |
| Premium AWD      | $47,490 | 0.99% / 72mo / $3,250 | $653 | 61% / 0.00004 | $449 |
| Performance AWD  | $54,990 | 0.99% / 72mo / $3,250 | $761 | 58% / 0.00029 | $599 |

Promos: 0.99% APR on Premium & Performance. Savings after delivery: cash $5,000 ·
finance $7,000 · lease $3,000.

## Model Y — 5 trims

| Trim | Cash | Finance APR / term / down | Fin $/mo | Lease resid% / MF | Lease $/mo |
|------|-----:|---------------------------|---------:|-------------------|-----------:|
| Standard RWD     | $39,990 | 0%    / 72mo / $3,300 | $529 | 60% / 0.00131 | $459 |
| AWD              | $41,990 | 0.99% / 72mo / $3,300 | $574 | 62% / 0.00185 | $499 |
| Premium RWD      | $45,990 | 0.99% / 72mo / $3,300 | $631 | 61% / 0.00231 | $599 |
| Premium AWD      | $49,990 | 0.99% / 72mo / $3,300 | $688 | 60% / 0.00267 | $699 |
| Performance AWD  | $57,990 | 5.69% / 72mo / $3,300 | $923 | 58% / 0.00209 | $799 |

Promos: 0% APR on Standard RWD; 0.99% on AWD/Premium. Savings after delivery: cash
$5,500 · lease $5,500 · finance $6,600.

## Other
- **FSD (Supervised):** $8,000 one-time, or **$99/mo** subscription (both models).
- Standard (non-promo) US loan rate is 5.69% (36–72mo) / 6.57% (84mo); promos drop
  selected trims to 0–0.99%. These are time-limited — re-pull before trusting.
- Lease residual schedule also has 24/36/48mo × 10k/12k/15k cells (residual 0.54–0.71);
  only the displayed default (36mo/10k) per trim is tabulated above.

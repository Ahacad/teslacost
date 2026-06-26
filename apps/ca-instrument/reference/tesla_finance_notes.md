# Tesla Canada — Finance & Lease math (Model 3 / Model Y)

Pulled live from `tesla.com/en_ca` configurator (finplat engine) on **2026-06-21**. All values CAD.
Both calculations run **client-side in the browser** — no server APR call — so the equations below are exactly what Tesla uses.

## Fees (added to every calc, both models)
`fees = $2,642` = freight/PDI + A/C levy + tire levy. Confirmed: cash-incl-fees − base = 42,132−39,490 = 52,632−49,990 = **$2,642**.
**Taxes (GST/PST/HST) are NOT included** in these numbers — Tesla applies provincial tax at checkout based on your address.

## Finance (loan) — standard amortization  ✓ validated to the dollar
```
P = base_price + fees − down_payment − incentives          (amount financed)
i = APR / 12                                                (monthly rate)
M = P · i / (1 − (1 + i)^(−n))                              (monthly payment)
```
Tesla defaults: **APR 5.03%**, **term 96 mo**, down **$4,300** (Model 3) / **$5,150** (Model Y).

### Rate by term — APR is NOT flat across terms
Tesla CA tiers the finance APR by loan length: a longer term carries a higher
rate (so a long loan costs more two ways — more months of interest *and* a worse
rate). Only the **96 mo = 5.03%** rung was read directly off the configurator
2026-06-21; the shorter rungs in `config.financeSchedule` are **estimates**
(`confirmed: false` → "est" in the UI), built by holding the 5.03% anchor and
stepping down by Tesla CA's *published* bracket shape (terms ≤60 / 72–84 / 96 in
~0.5% steps; e.g. driveteslacanada's standard Model-Y ladder 2.99/3.49/3.99).

| Term | APR | Source |
|---|---|---|
| 36 / 48 / 60 mo | 4.03% | est (anchor − 1.00, ≤60 bracket) |
| 72 / 84 mo | 4.53% | est (anchor − 0.50, mid bracket) |
| 96 mo | **5.03%** | ✓ read off tesla.com 2026-06-21 |

**TODO (live pull):** read the exact standard APR for each term off the
configurator's finance modal (click the term selector, §4) and replace the
estimated rungs — Akamai-walled, needs the headful-Chrome CDP path (§0–3).

| Config | P (financed) | Monthly | Site |
|---|---|---|---|
| M3 Premium RWD ($39,490) | $37,832 | **$479** | $479 ✓ |
| M3 Premium AWD ($49,990) | $48,332 | **$613** | $613 ✓ |
| M3 Performance ($74,990) | $73,332 | **$929** | $929 ✓ |
| MY RWD ($49,990) | $47,482 | **$602** | $602 ✓ |
| MY Premium ($64,990) | $62,482 | **$792** | computed |
| MY Performance ($74,990) | $72,482 | **$919** | computed |

## Lease — depreciation + rent charge
```
adjCap = base_price + fees − down(cap reduction) − incentives
MF     = APR / 2400                                          (money factor)
depreciation = (adjCap − residual) / n
rent_charge  = (adjCap + residual) · MF
M = depreciation + rent_charge
```
Tesla defaults: **APR 4.9272%** (MF 0.002053), **term 48 mo**, **16,000 km/yr**, down **$5,000** (cap reduction; "$5,681 due at signing" adds first payment + $250 order deposit).

Read directly for **M3 Premium RWD**: residual **$16,377** (= 41.5% of base).
→ adjCap 37,132 · dep $432/mo + rent $110/mo ≈ **$539/mo** (site $539).

Captured lease monthlies (M3): RWD **$539**, AWD **$669**, Performance **$1,049**.
Residual % for non-RWD trims is approximate (only RWD's residual was read directly). **Model Y lease did not activate in the captured session** — tab present but stayed on finance; treat MY lease as not-yet-confirmed.

## How to adjust
Open `tesla_payment_calculator.html` in any browser. Pick a vehicle (prefills Tesla's defaults), then change down payment / APR / term / residual / mileage and the monthly updates live. Both equations and the breakdown are shown.

## Files
- `tesla_payment_calculator.html` — interactive calculator
- `tesla_payments.csv` — per-trim finance & lease monthlies + parameters
- `tesla_trims.csv`, `tesla_options.csv`, `tesla_dataset.json` — full configurator price data (from prior pull)

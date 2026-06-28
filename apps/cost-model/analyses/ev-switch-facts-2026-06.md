# Raw verified facts — June 2026

All figures **as of June 2026**, web-sourced and adversarially verified. Confidence
and caveats noted per item. **Reconfirm with VIN-specific quotes and live
manufacturer sites before signing** — prices, APRs, and offers move week to week.

---

## 1. The Kia (residual value) — refreshed June 2026 from a multi-source pass

2025 Kia Sportage **AWD, pure gas** (2.5L, non-hybrid), EX/X-Line mid-trim, bought
**new ~October 2025**, so **~8 months old now** with **~15,500 mi** (high for age at
~23,400 mi/yr), Seattle/WA market. **Amount owed now: ~$30,000.**

**Cost basis:** MSRP incl. $1,395 destination ~$33,185 (EX AWD $31,290 / X-Line AWD
$32,290); real pre-tax transaction ~$30,300 (KBB Fair Purchase −$2.6–3.5k, Oct-2025
sell-down) = the depreciation basis. WA OTD ~$33.8k ≈ amount financed (implies near-zero
down). Sales tax is sunk — never recovered in resale.

**Forward residual (high-mileage-adjusted), months from now [0,12,24,36,48,60,72,96]:**

| | 0 | 12 | 24 | 36 | 48 | 60 | 72 | 96 |
|---|--|--|--|--|--|--|--|--|
| Private-party | 24,000 | 19,500 | 16,850 | 14,550 | 12,550 | 10,850 | 9,200 | 6,300 |
| **Dealer trade-in** | **21,000** | 16,950 | 14,550 | 12,500 | 10,700 | 9,200 | 7,750 | 5,250 |
| Instant cash (≈trade) | 21,700 | 17,500 | 15,050 | 12,900 | 11,050 | 9,500 | 8,050 | 5,400 |

- **Negative equity now: ~$9,000 on trade** ($30k owed − $21k), ~$6,000 on private sale.
  This is *derived*, not assumed: `negEquity(D) = loanBalance(D) − tradeValue(D)`.
- **Method:** retained-% by calendar age (real age = 8mo + anchor) from a monotone blend
  of iSeeCars (3yr 75.7%, 5yr 56.8% retained) and CarEdge (Y1 76.4% … Y5 50.4%), applied
  to the $30.3k basis; minus a high-mileage haircut (~$/1k-excess-mile decaying from ~$155
  near 15.5k mi to ~$50 by 200k), excess vs a 12k-mi/yr twin; month-0 calibrated to the
  field-validated $24k/$21k. Decel check: private $/yr drop 4.5k→2.6k→2.3k→… (monotone).
- Real-world MPG (highway-heavy): **~29 mpg** (EPA 25 combined; AWD road tests 27–31 hwy).
- **The crossover:** on the modeled $30k @ 5.1% / 35-mo-left loan ($924/mo), paydown
  (~$900/mo) outruns trade depreciation (~$340/mo), so the trade gap **shrinks to zero by
  ~month 17** — waiting erases the negative equity. *But* a longer real loan (e.g. 72-mo,
  ~$520/mo) keeps you underwater far longer: confirm your real remaining term.
- **Confidence: medium** (triangulated, not a VIN appraisal — KBB/Edmunds/Carvana/CarMax
  pages were bot-walled / need VIN+ZIP+condition; month-0 anchored to the conservative end).
  Sources: KiaMedia, iSeeCars, CarEdge, KBB, Edmunds, CarGurus. Adversarially verified
  (curve defensible; the load-bearing caveat is the real loan term).

---

## 2. Model Y — NEW

| Item | Value |
|---|---|
| Base + destination/order | **~$51,380 incl. dest** ($1,390 dest + $250 order); ~**$51,630 OTD before tax** |
| WA vehicle tax | +~11.05% (~$5,700) |
| **Finance APR** | **0.99% promo, up to 72 mo, ~5% (~$2,569) down — ONGOING** |
| Fallback APR (no down) | ~6.27% prime (720 tier) |
| Lease (AWD) | $699/mo, 36 mo, $4,395 down, **10k-mi/yr cap** ($0.25/mi excess) — poor fit |
| EPA range | 327 mi (19" wheels) |
| Real highway (70 mph) | ~298 mi; cold-weather low ~186 mi |
| Apple CarPlay | **No** |
| US-assembled | Yes (qualifies for the new auto-loan-interest deduction) |

- **0.99% is a genuinely good, ongoing promo** (corrected from an earlier wrong
  "expires 6/30" guess). It lowers the *payment* (~$913/mo vs ~$1,108 at 6.27%,
  ~$11.5k less lifetime interest) but does **not** fix the underwater balance.
- **Confidence: medium** on price/APR/lease — tesla.com returned 403 (bot-blocked),
  so figures are aggregator-sourced (Cars.com, Edmunds). **Reconfirm on tesla.com.**

---

## 3. Model Y — USED (1–3 yr, WA/PNW)

| Year / trim | Asking (USD) | Miles |
|---|---|---|
| 2023 LR AWD | ~$33,000–35,000 | ~30–40k |
| 2024 LR AWD | ~$32,000–37,000 | ~20–30k |

- **Used APR ~10%** for a 720 buyer (rising; ~4-pt penalty vs new) — erodes much of
  the lower sticker.
- Warranty: basic 4 yr/50k (a 2023 is nearly spent); battery 8 yr/120k transfers
  from in-service date (verify by VIN, not model year).
- No federal used-EV credit ($0; 25E died 9/30/2025). No CarPlay.
- **Confidence: high** on price bands (corroborated across Edmunds, CarGurus,
  TrueCar, KBB, CARFAX). Prices soft/stabilizing.

---

## 4. BMW iX3 / i3 (Neue Klasse) — the "wait" option

| Item | Value | Status |
|---|---|---|
| **iX3 50 xDrive — US delivery** | **Sept 25, 2026** (preorder now, $1,000 deposit) | **Confirmed** |
| iX3 50 xDrive price | **$61,500 + $1,350 dest**; M Sport $64,000; M Sport Pro $65,500 | Confirmed |
| iX3 40 xDrive (cheaper) | **< $55,000**, early 2027 | Undated |
| i3 sedan | 2027, US price not official (~low–mid $50ks) | Estimated |
| Range | up to **434 mi** (20" summer); **383 mi** std all-season | Confirmed |
| Charging | **800V, peak 400 kW, 10–80% ~21 min** | Confirmed |
| NACS / Supercharger | **Native J3400 from factory** (no adapter) | Confirmed |
| Apple CarPlay | **Yes** (+ real instrument display + HUD) | Confirmed |
| US-assembled | **No** (Hungary) → **no loan-interest deduction** | Confirmed |
| Insurance (Seattle) | ~$300–425/mo | Composite |

- The dream pick on features (CarPlay, HUD, 434 mi, NACS), but the **priciest path**
  and worst on the paramount "financial sense" priority.
- **Confidence: high** on iX3 50 (BMW PressClub, Electrek, May 2026); i3 and iX3-40
  pricing/timing unconfirmed (2027).

---

## 5. Rival CarPlay EVs (Hyundai Ioniq 5/6, Kia EV6)

| Model | Start price | AWD range | 10–80% DCFC | Notable |
|---|---|---|---|---|
| Ioniq 5 (2026) | from $35k (+~$1.6k dest; AWD +~$3.5k) | 259–290 mi | ~20 min (800V) | **Lease from ~$259/mo (~0% MF)**; 0% APR or up to $7k cash |
| Ioniq 6 (2026) | from ~$37,850 | ~270–291 mi | ~18 min | RWD up to 342 mi |
| Kia EV6 (2026) | $37,900–59,000 | 270–295 mi | ~18 min | Lease from ~$349/mo; $3k cash or 0% 60mo |

- **All three:** standard wireless Apple CarPlay + Android Auto, **native NACS** on
  2026 models, 800V (throttles to ~95–125 kW at older Tesla V3 stalls).
- Insurance (Seattle): **~$175–230/mo** — cheapest of the EV options.
- Ioniq 5 is US-assembled (GA). **Lease uniquely fits "minimal hassle + unsure
  holding period."**
- **Confidence: high** on specs; lease deals are region/ZEV-state varying and
  time-limited — confirm locally.

---

## 6. Costs, taxes, credits

| Item | Value |
|---|---|
| Gas (Seattle metro) | **~$5.61/gal** (WA state ~$5.30); 3rd-priciest US state; elevated (Strait-of-Hormuz), easing weekly |
| WA sales tax (Seattle) | **10.55%** retail; **~11.05%** on a vehicle |
| WA EV sales-tax exemption | **DEAD** (expired 7/31/2025; $45k cap excluded a Model Y anyway) |
| Federal §30D (new EV $7,500) | **$0** — terminated for vehicles acquired after 9/30/2025 (OBBBA) |
| Federal §25E (used EV $4,000) | **$0** — terminated |
| Federal §45W (lease $7,500) | **$0** — terminated; **no lease loophole in 2026** |
| New auto-loan-interest deduction | up to $10k/yr interest thru 2028, **US-assembled new EVs, loan-financed only** (Model Y / Ioniq 5 qualify; BMW iX3 does NOT) |
| WA state / utility purchase rebate | **None active** (WA Instant Rebate closed). PSE home-charger rebate is residential-only (irrelevant — no home charging) |
| **Auto APR (720 tier)** | **new 6.27% / used ~10%** prime (Experian Q3-2025; blended risen to ~6.39%/11.43% Q1-2026) |

- **Confidence: high.** Federal-credit status triple-checked against IRS/OBBBA.

---

## 7. Charging & the Seattle↔Vancouver corridor (the crux)

> **CORRECTION (supersedes the DC-charging framing below).** The round trip is
> **~280 mi, less than a Model Y's ~298 mi real-highway range**, so it fits on
> roughly **one charge** — no routine DC needed. The user tops up on **L2 at the
> destination** (parked anyway). The office L2 governs only the ~36% weekday miles.
> Realistic EV energy is **~$50/mo** (cheap destination L2), **~$120/mo** winter/paid,
> **~$184/mo** only if the office charger is lost — not the `$58/$184` band below.
> Winter (cold range ~186 mi) needs an overnight L2 top-up or one DC splash on a
> same-day trip; confirm the Vancouver side is real 240V L2. See
> [`ev-switch-cost-model-2026-06.md`](ev-switch-cost-model-2026-06.md).

- **Corridor is the densest fast-charge route in North America.** Tesla
  Superchargers chain all of I-5 (<60 mi spacing); **Burlington WA** (32+ stalls)
  is the natural mid-trip top-up. Native-NACS Hyundai/Kia/BMW share it.
- **Weekend round trip (~280 mi) fits ~one charge** (see correction) — destination
  L2 covers any top-up; a US-side DC splash is the winter same-day fallback, not the
  routine. Cold-highway range falls toward ~186 mi.
- **Weekdays (~160 mi) are covered FREE by office L2** — the de-facto home charger.
- **Supercharger pricing:** WA ~$0.18–0.36/kWh (time-of-use); BC ~$0.29–0.48 CAD/kWh
  (cheapest Canadian province; central Vancouver cheapest).
- **Single point of failure:** the office charger. No home backup (120V adds only
  ~3–4 mi/hr). If it gets capped/queued/decommissioned, all miles go to paid DC:
  **~$184/mo vs ~$58/mo best case** (+$126/mo, ~$4.5k/3yr). **Verify the
  stall-to-EV ratio and any caps in writing before betting a car on it.**
- **Confidence: medium** (corridor/pricing corroborated; the office-contention risk
  is from industry data, not this employer).

---

## 8. Insurance (Seattle, ~720 credit, monthly full-coverage)

| Vehicle | Estimate |
|---|---|
| Kia Sportage (current actual) | $283 |
| Tesla Model Y | ~$200–280 |
| Hyundai/Kia EV | ~$175–230 (cheapest) |
| BMW iX-class | ~$300–425 (most) |

Composite ranges — **get a real quote for your ZIP**; it's a swing factor,
especially BMW vs the Kia baseline.

---

## Biggest remaining uncertainties

1. **Office L2 contention at the specific employer** — the load-bearing assumption.
2. Kia's exact VIN value (triangulated).
3. BMW i3 / cheaper iX3-40 pricing (unconfirmed 2027).
4. Tesla price/offers — reconfirm on tesla.com (0.99% ongoing but terms change).
5. Real personalized insurance quote.
6. Whether purchase is US-side (assumed) vs Canada (the Vancouver leg is in CA).

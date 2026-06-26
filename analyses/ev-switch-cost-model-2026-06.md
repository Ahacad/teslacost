# Cost model — Kia vs the other worlds (June 2026)

Answers the direct question: **how much would I pay over time if I keep the Kia, vs.
switching to each alternative** — under the real scenario, gas, and (corrected) electric
prices. Supersedes the energy assumptions in
[`ev-switch-facts-2026-06.md`](ev-switch-facts-2026-06.md) §7 (see "Energy correction" below).

Interactive version (flex the assumptions yourself): self-contained
[`tesla-cost-model.html`](tesla-cost-model.html) — sliders for holding period, gas price,
miles/yr, EV charging case, and net-of-resale vs. cash. Recomputes live in the browser
with exact loan amortization.

## Energy correction (the load-bearing fix)

The earlier facts doc assumed the weekend Seattle↔Vancouver trip "needs ~1 DC fast-charge"
and priced a `$58 best / $184 worst` band tied to the office charger. **That was wrong.**

- The round trip is **~280 mi, less than the Model Y's ~298 mi real-highway range** → it
  fits on roughly **one charge**. You leave the office filled (free L2) and **top up on L2
  at the destination** (parked anyway — friend/hotel/public), not on paid DC.
- The office L2 only governs the **~36% weekday miles**; the weekend trip is L2-at-destination
  in every case.
- **Realistic EV energy: ~$50/mo** (free/cheap destination L2) typical; **~$120/mo** in a
  winter/paid case; **~$184/mo** only in the stress case where the office charger is lost.
- Winter caveat: cold highway range falls to ~186 mi < 280 mi, so a **same-day** winter round
  trip needs an overnight L2 top-up or one DC splash. Confirm the Vancouver-side charging is a
  real **240V L2** (~25 mi/hr), not a 120V wall outlet (~3–4 mi/hr).

Net effect: the gas-vs-EV saving is **~$300/mo** (gas $377 vs EV ~$50–70), restoring most of
the original best case and pulling break-even **earlier** than the office-charger framing implied.

## The model

Net cost at month *M* = **every dollar out of pocket** (down + payments through min(*M*, term)
+ insurance + energy + gas + maintenance) **minus terminal equity** (resale − remaining loan
balance). Loans amortized exactly. The ~$9,000 Kia negative equity (trade-in basis) + WA 11.05%
tax are rolled once into each switch's principal; keeping the Kia does **not** crystallize it
(you keep paying the original $30k/5.1%/35-mo loan). Math audited to the cent.

Defaults: 23,400 mi/yr, gas $5.61/gal, EV energy $50/mo (cheap case), Kia 29 mpg.

| World | Upfront | Monthly all-in | Net @ 36 mo | Net @ 60 mo | Beats Kia | Walk-away-whole | Owns |
|---|--:|--:|--:|--:|:--:|:--:|:--:|
| **Ioniq 5 — buy @ 0%** (CarPlay) | $0 | ~$1,023 | **$44.6k** | **$57.3k** | mo 26 | mo 53 | yes |
| **New Model Y @ 0.99%** | $2,569 | ~$1,226 | $45.2k | $61.1k | mo 23 | **mo 33** | yes |
| Used Model Y @ ~10% | $0 | ~$1,176 | $46.2k | $62.4k | mo 23 | mo 46 | yes |
| **Keep the Kia** (baseline) | $0 | $1,654 → $730 | ~$48.6k | **~$69.2k** | — | n/a | yes |
| PHEV (RAV4-class) — *estimate* | $0 | ~$1,250 | $52.4k | $72.7k | mo 88 | mo 39 | yes |
| New Model Y @ 6.27% | $0 | ~$1,421 | $53.6k | $72.2k | mo 77 | mo 41 | yes |
| Ioniq 5 — lease | $0 | ~$790 | rent | rent | mo 1\* | **never** | **no** |

\* The lease's low monthly is **pure rent** — it builds zero equity, so you own nothing and can
never walk away whole. At 23,400 mi/yr the mileage overage already inflates it to ~$790–890/mo.
Not a real win; shown to demonstrate why a lease is a poor fit at this mileage.

> **Why the Kia is so costly by 60 mo (~$69k):** for the first 35 months you pay the $924 loan
> *and* $377 gas at the same time ($1,654/mo), then keep buying gas. The gas line is the single
> biggest cost in the whole comparison.

## The answer

- **Cheapest path you'd actually own: Ioniq 5 bought at 0% APR.** Lowest payment of any buy
  ($743), cheapest insurance ($200), lowest net cost at 36 and 60 mo, and it has CarPlay. Beats
  keeping the Kia by ~month 26. Catch: fast Hyundai depreciation + the $9k roll keep you
  underwater until ~month 53.
- **Best to own-and-be-able-to-exit: new Model Y @ 0.99%.** Holds value best and is
  equity-positive by ~month 33 — you can sell without writing a check. Needs ~$2.6k cash up
  front; no CarPlay.
- **Avoid:** the **6.27% Model Y** (the $1,112 payment only beats the Kia at ~month 77) and the
  **lease** (perpetual rent, zero equity).

## What flips it (hinges)

1. **Holding period.** Under ~36 mo every buy is still underwater; the underwater math dominates.
   Over ~48 mo the Ioniq wins clean. If you might sell early, the MY @ 0.99% (whole by ~mo 33)
   is the safer pick despite a slightly higher net cost.
2. **Office-L2 reliability.** Cheap energy ($50) assumes it holds. If it's lost (→$184/mo), every
   pure EV's edge shrinks and the **PHEV/Kia** become the charger-independent hedge.
3. **PHEV outlet access.** Its safety case assumes a reachable 120V outlet at your apartment stall.
   No outlet → it runs as a 38 mpg hybrid and the energy line jumps. It's an estimate, not a quote.
4. **Resale.** A Tesla price cut or the 70k-mi/3-yr haircut (you drive 2× average) trims the MY's
   hold-value edge. The interactive model has a "conservative resale" toggle.

## Reconciliation with "keep the Kia"

Not a contradiction. The prior [`decision`](ev-switch-decision-2026-06.md) call was a **risk**
statement (zero upfront, zero underwater months, zero charging bet) and still holds as one. On
**dollars**, with energy corrected, switching is the cheaper path on any hold past ~30 months —
to the **Ioniq 5 @ 0%** for the lowest cost with CarPlay, or the **Model Y @ 0.99%** if you can
spare $2.6k and want an asset you can exit whole. Keep the Kia only if you value liquidity and
risk-immunity over ~$3–12k of net savings by years 3–5, or you might not hold past ~30 months.

---

*Estimates, June 2026. Built from [`ev-switch-facts-2026-06.md`](ev-switch-facts-2026-06.md) +
[`ev-switch-baseline.md`](ev-switch-baseline.md), modeled across 7 worlds and adversarially
verified (math recompute + assumptions realism). Reconfirm VIN-specific quotes, your real APR,
and an insurance quote before signing.*

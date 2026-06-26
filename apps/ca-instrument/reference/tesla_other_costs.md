# Tesla Canada — the costs beyond the sticker (Model 3 / Model Y)

Snapshot **2026-06-21**, CAD. These stack on top of the financing payment in `tesla_scenarios.md`. Split into **one-time** and **recurring monthly**, each marked *needed?* so you can include or drop it.

## One-time (at or near purchase)

| Item | Cost | Needed? | Notes |
|---|--:|---|---|
| **Sales tax (HST/PST+GST)** | **13% in ON** | **Mandatory** | The big one. ON $5.5k–$10k. AB 5% (cheapest), BC 12%+luxury surtax >$55k, QC ~15%, Maritimes 15%. Finance: rolled into loan. Lease: charged per payment instead (see below). |
| Freight/PDI + levies | $2,642 | Mandatory | Already in every quote (A/C + tire levy + freight). |
| Order/order fee | $0 | — | Tesla CA order fee is refundable/applied; no separate doc fee. |
| Home charging — Wall Connector | ~$625 hardware | Recommended | Best home charging; needs a qualified electrician. Installed all-in typically **$1,200–2,500** incl. panel/wiring. |
| Home charging — Mobile Connector | $345 | Alternative | Plugs into a 240V (NEMA 14-50) outlet; cheaper if you already have the outlet. Slower on a standard 120V plug. |
| Winter tires + rims (Canada) | ~$1,800–2,500 | Strongly rec. (most provinces) | Mandatory in QC; smart everywhere with snow. One-time, reused yearly. |
| Accessories (mats, PPF, etc.) | $200–2,000 | Optional | All-weather mats ~$250, paint protection film $1,000–2,000, mud flaps, console wraps. Pure preference. |

## Recurring (monthly)

| Item | Cost/mo | Needed? | Notes |
|---|--:|---|---|
| **FSD (Supervised) subscription** | **$99** | Optional | Since **Feb 14 2026 the one-time $11k purchase is gone** — subscription is the only way. $49/mo if you previously bought Enhanced Autopilot. Cancel anytime. |
| Premium Connectivity | $13.99 | Near-essential | Live traffic, satellite maps, streaming/browser over cellular. Trial at delivery, then $14. Basic nav works without it. |
| Insurance | $180–230 (est.) | Mandatory | Estimate; ON tends high. Varies hugely by driver, history, city. Performance trims cost more. Get a real quote. |
| Home electricity (charging) | ~$30 (M3) / ~$33 (MY) | Mandatory-ish | 16,000 km/yr ≈ 230–260 kWh/mo. ON cost swings with your rate plan: ~$0.07/kWh (ULO overnight) → ~$0.13 (TOU off-peak) → ~$0.18 (no EV plan). QC ~$0.08, AB ~$0.18–0.20, BC ~$0.13. **Supercharging ~2–3×** home. |
| Tires + maintenance | ~$40 | Mandatory-ish | Tires ~$1,400/set ÷ ~50,000 km wear ≈ $37/mo (Performance trims $1,800–2,400/set, shorter life) + cabin filter, wipers, brake fluid ~$4. EVs skip oil/spark/transmission but eat tires ~20% faster (weight + torque). |
| Plate/registration renewal | ~$0–10 | Mandatory | ON renewal is free; other provinces $60–120/yr. |

## Two ways to count the monthly extras

| Bundle | What's in it | Model 3 | Model Y |
|---|---|--:|--:|
| **Essentials** | connectivity + charging + tires/maint + insurance (no FSD) | ~$284/mo | ~$297/mo |
| **Loaded** | Essentials + FSD $99 | ~$383/mo | ~$396/mo |
| **Tesla-only** | connectivity + FSD (the stuff that's actually Tesla, not any-car) | ~$113/mo | ~$113/mo |

So before the car payment, budget **~$280/mo essentials** or **~$380/mo loaded** in running costs — then add the finance/lease payment from `tesla_scenarios.md`.

## How the running-cost estimate is built (verified against current sources)

"Running" in the scenario tables = **connectivity + charging + tires/maint** (~$84/mo M3, ~$87/mo MY). Insurance and FSD are separate. Each input below was cross-checked June 2026; point estimates are mid-range, with the real spread called out.

**Home charging** — formula:

```
16,000 km/yr ÷ 12        = 1,333 km/month        (Ontario avg; Tesla's lease default)
1,333 km × 17.5 kWh/100km = ~233 kWh/month  (M3 annual avg; MY ~260)
233 kWh × $0.13/kWh       = ~$30/month       (Ontario TOU off-peak)
```
- **Price $/kWh (the big swing):** Ontario *marginal* overnight is ~$0.07 on the ULO plan, ~$0.13 on TOU off-peak, ~$0.18 with no EV-friendly plan (delivery+regulatory+HST roughly double the commodity rate). QC ~$0.08 (cheapest), AB ~$0.18–0.20, BC ~$0.13. We use **$0.13 (TOU)** as the central.
- **Consumption:** wall-to-wheel (incl. ~10–12% charging loss) is M3 ~16–17 / MY ~18–19 kWh/100km in summer, rising to **M3 ~19–22 / MY ~21–25 in Canadian winter**. We use a ~17.5/~19.5 annual average — so $30/$33 is a year-round mean; Jan–Feb runs higher.
- **Assumes 100% home charging.** Supercharging is ~2–3× the per-kWh cost.

**Tires + maintenance** — amortized:

```
Tires: $1,400/set ÷ 50,000 km × 16,000 km/yr = $448/yr ≈ $37/mo  (all-season)
+ cabin filter, wipers, brake fluid, washer            ≈ $4/mo
                                                  total ≈ $40/mo
```
- **Tire life ~50,000 km** (range 32k–64k; factory spec ~48k). EVs wear tires ~20% faster than ICE (battery weight + instant torque). Performance trims: $1,800–2,400/set on shorter life → materially higher.
- EVs **skip** oil changes, spark plugs, transmission service — so tires dominate this line.

**What's firm vs soft:** Connectivity $14 and FSD $99 are exact Tesla prices. Charging and tires are estimates with the ranges above. **Insurance ($180–230) is the single biggest variable** and not a Tesla cost — get a real quote. All are toggles/overridable in `tesla_dashboard.html`.

*Verified via:* OEB/CER (electricity), EV Database + Spritmonitor + InsideEVs (consumption + charging losses), Blackcircles.ca/Michelin/Tesla (tires), StatCan/NRCan Canadian Vehicle Survey (annual km).

## Sources

- FSD subscription $99/mo CAD; one-time purchase ended Feb 14 2026 — [Tesla Support CA](https://www.tesla.com/en_ca/support/full-self-driving-subscriptions), [Teslarati](https://www.teslarati.com/tesla-fsd-subscriptions-canada/)
- Premium Connectivity $13.99/mo CAD — [Tesla Support CA](https://www.tesla.com/en_ca/support/connectivity)
- Wall Connector ~$625 / Mobile Connector $345 CAD — [Drive Tesla Canada](https://driveteslacanada.ca/news/tesla-adjusts-prices-on-its-home-charging-products/), shop.tesla.com/en_ca
- Insurance / electricity / tire figures are representative estimates — confirm for your province & profile.

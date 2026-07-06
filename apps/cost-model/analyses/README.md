# EV switch analysis — Kia Sportage → ? (Seattle, 2026)

Raw facts and decision notes for: **should I trade my 2025 Kia Sportage AWD for
a Model Y (or another EV)?** Captured June 2026. Kept here for future re-decision
(the recommendation is to re-evaluate ~spring 2027).

## TL;DR

**Keep the Kia for now.** Financially, waiting vs. switching is ~a wash (~$130).
What tips it: ~$9k underwater on the Kia + ~$0 cash + no home charging + only car.
Don't crystallize the loss or bet your only car on one office charger yet.
When you do move, the shortlist is a **PHEV** or an **Ioniq 5 lease** — not the
$66k-underwater Tesla, and not the BMW (a want, not a financial pick).

## Green-light timeline

The trigger is your **equity gap closing** (~$630/mo: ~$810 principal − ~$180
depreciation), not a date.

| When | Milestone |
|---|---|
| Now (Jun 2026) | Hold. ~$9k underwater — don't roll into a new loan. |
| Sep–Oct 2026 | BMW iX3 lands — test-drive it, settle the BMW question. |
| **~Apr 2027** | **GREEN LIGHT** — payoff ≈ private-sale value (~$24k); switch with no negative equity. |
| ~Aug 2027 | Trade-in break-even (~$21k); iX3-40 / i3 pricing known. |

**Concrete trigger:** each month compare your Kia payoff to a Carvana/KBB quote.
The month payoff ≤ quote, you're clear to move.

## Files

- [`bump-index-methodology-2026-07.md`](bump-index-methodology-2026-07.md) — **July 6, 2026: the objective road-bump scoring system.** Turns the scorecard's "6 Kia wins" into a reproducible number: every dimension scored `side × magnitude × exposure × weight`, where side/magnitude are evidence-fixed and exposure/weight are tuned to the owner's real usage (60mi/day commute w/ free work charging, Seattle↔Vancouver weekends, Android/live-traffic-nav, skis-on-roof, no heavy towing). Result: **7 bumps vs 8 boons, boons win ~2:1** and the surviving bumps are all financial (insurance, depreciation, FSD). Interactive in the [Upgrade-Verdict artifact](../artifacts/upgrade-verdict.html); toggles recompute live.
- [`worth-it-model-2026-07.md`](worth-it-model-2026-07.md) — **July 6, 2026: is the upgrade worth its ~$322/mo?** Prices the experience bundle two ways: your own willingness-to-pay sliders vs a market fair value from adversarially-verified anchors (hands-free ADAS = median of FSD/BlueCruise/Super Cruise = $50/mo; performance-trim step; Premium Connectivity; etc.). Market fair value **$214/mo** vs the $322 price → **a want, not a value** (Tesla asks ~$108/mo over market; the FSD line alone is $109/mo paid for $50/mo of capability). Interactive "Is it worth it?" panel in the artifact.
- [`cargo-space-my-vs-sportage-2026-07.md`](cargo-space-my-vs-sportage-2026-07.md) — **July 5, 2026: the full cargo accounting.** Every volume read straight off Tesla's + Kia's own spec pages. The Sportage wins behind the back seat by ~10 cu ft (39.6 vs 29.0) and folded box-for-box (74.1 vs 71.4); the Model Y's "75.5 max" only wins once you count the frunk and its two-passenger framing — an apples-to-oranges number. Model Y answers with a drainable frunk, deep sub-trunk well, and power-fold seats. Includes the measurement-standard traps, both outlets' luggage tests, and the note that the deep-research verifier failed on a quota limit so all figures were re-checked against primary sources.
- [`model-y-vs-sportage-upgrade-2026-07.md`](model-y-vs-sportage-upgrade-2026-07.md) — **July 4, 2026: is the refreshed MY actually a better car?** Verified 6-dimension comparison vs the owned Sportage X-Line: big wins on performance/tech/safety/noise/fuel, downgrades on daily cargo (−10 cu ft; see the cargo deep-dive above), CarPlay, and depreciation. Net: a ~$320/mo luxury upgrade; the used-MY path is pre-refresh and loses the ride/noise fixes. Includes the two refuted claims (no free Autosteer since Jan 2026; the "Sportage rides smoother" forum quote is fabricated).
- [`insurance-reality-check-2026-07.md`](insurance-reality-check-2026-07.md) — **July 4, 2026: real insurance quotes** (GEICO $500/mo, Progressive $417/mo vs the $230 estimate), verified market benchmarks (new-MY ≈ $380–400/mo; Progressive at market, GEICO ~25% high), carrier spread, Tesla-Insurance-in-WA timing (~Sept 2026), and the verdict impact (+$19.4k new build; used-MY edge thins to ~$4.4k at realistic premiums).
- [`model-y-premium-awd-seattle-2026-07.md`](model-y-premium-awd-seattle-2026-07.md) — **July 2026: the exact configured build** (Premium AWD + Quicksilver + white interior + tow hitch + roof rack + FSD sub), live-configurator prices, 11.05% Seattle vehicle tax, max checkout ≈ $63.1k, 0.99%/72 promo math, and the FSD-flips-the-verdict finding. Supersedes the generic new-MY figures below.
- [`ev-switch-baseline.md`](ev-switch-baseline.md) — the personal inputs (situation, loan, driving, charging, constraints).
- [`ev-switch-facts-2026-06.md`](ev-switch-facts-2026-06.md) — **the raw verified market facts** (prices, range, charging, taxes, credits, APRs, insurance) with sources + confidence.
- [`ev-switch-decision-2026-06.md`](ev-switch-decision-2026-06.md) — ranking, weighted matrix, TCO, recommendation, sensitivity, action plan.
- [`ev-switch-cost-model-2026-06.md`](ev-switch-cost-model-2026-06.md) — **the 7-world cost model** (keep Kia vs new/used Model Y, Ioniq 5 buy/lease, PHEV): net cost over time + break-even, with the corrected charging/energy assumptions. Interactive: [`tesla-cost-model.html`](tesla-cost-model.html).

## How these were produced

Baseline interview → fact-gathering workflow (7 web-research agents + compile +
adversarial verify) → decision workflow (5 per-option TCO models + weighted
decision + 3-lens stress test). All web-sourced June 2026 and adversarially
checked. **Figures are best-estimate composites — reconfirm with VIN-specific
quotes and live tesla.com/bmwusa.com before signing.**

## Interactive version

A self-contained HTML report of this analysis was generated separately
(`tesla-kia-ev-decision` artifact). These docs are the durable, plain-text record.

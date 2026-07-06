# Is it worth it? — pricing the Model Y upgrade (you vs the market)

**July 6, 2026.** The [Bump Index](bump-index-methodology-2026-07.md) established
that the Model Y is a real net improvement over the Sportage (Net **+30.9**,
boons ~2:1). This is the second half: *is that improvement worth what it costs?*
Interactive in the [Upgrade-Verdict artifact](../artifacts/upgrade-verdict.html)
("Is it worth it?" section).

## The framing that makes it honest

The cost is already a full net accounting: **~$322/mo** (+$19.4k over 5 yr) is
what the configured build costs *after* crediting the fuel savings and
subtracting the higher insurance, depreciation, and FSD rent. So the money is
settled — what $322/mo actually *buys* is the **experience bundle** (quicker,
quieter, smoother, better tech, safer, hands-free), minus the experience
downgrades (less cargo, no CarPlay). "Worth it" = would you pay $322/mo for that
bundle? Two independent answers:

1. **Willingness to pay** — you assign what each upgrade is worth to you per
   month; the tool sums it and compares to the price. Subjective input, objective
   arithmetic.
2. **Market fair value** — each upgrade priced at what it costs elsewhere
   (subscriptions + amortized option/trim premiums), so you can see if your gut
   matches what the market charges.

Money items (energy, insurance, depreciation, FSD *cost*) are excluded from the
bundle — they're already inside the $322. The FSD *capability* stays in as an
experience line; its cost stays in the price. That coupling is the point: you pay
~$109/mo for FSD but the hands-free capability is worth ~$50/mo at market.

## Market anchors — sourced and adversarially verified

Six anchors sourced by web research, each re-checked by an independent agent
told to refute it (`worth-it-market-anchors` workflow, run wf_48ed1952; 12
agents, 0 errors). One-time premiums amortized over 60 months. The **stand-behind**
column is the post-verification figure used in the artifact.

| Upgrade | First pass | Verdict | **Stand-behind** | Basis / source |
|---|--:|:--|--:|---|
| Hands-free ADAS | $50 | SUPPORTED | **$50**/mo | median of FSD $99, Ford BlueCruise $49.99, GM Super Cruise $39.99 (tesla.com / ford.com / chevrolet.com) |
| Performance (3.9s) | $167 | OVERSTATED | **$125**/mo | isolated performance-trim step ~$7.5k (Model 3 Perf vs LR AWD) ÷ 60 (Edmunds/InsideEVs) |
| Ride + quiet | $25 | OVERSTATED | **$15**/mo | acoustic glass + suspension — but the refreshed MY uses **passive**, not adaptive, dampers, so most value is the glass |
| Screens/nav | $35 | OVERSTATED | **$22**/mo | Premium Connectivity $9.99/mo + a modest large-screen/nav premium |
| Crash safety | $15 | SUPPORTED | **$13**/mo | a 5★ rating can't be bought; only the active-safety kit prices (VW IQ.Drive ~$895; Chevy bundle $1,485) ÷ 60 |
| − What you give up | −$15 | OVERSTATED | **−$11**/mo | wireless CarPlay + ~10 cu ft cargo, weakly monetized (McKinsey: <20% ICE / ~30% EV pay extra for CarPlay) |

**Market fair value = $125 + $15 + $50 + $22 + $13 − $11 = $214/mo.**

## The answer

| | Price | Your value | Market fair value |
|---|--:|--:|--:|
| Your build · FSD on | **$322/mo** | ~$190/mo (default guesses) | **$214/mo** |
| Gap vs price | — | −$132/mo | −$108/mo |

**On both counts the new build is a want, not a value.** The market says the
bundle is worth ~$214/mo and Tesla asks $322 — a ~$108/mo premium over fair
value (the FSD line alone is ~$109/mo paid for ~$50/mo of market value). Your
personal default value (~$190/mo) lands even lower. You'll enjoy the car; you
won't "save" on it, and you'd be paying roughly $110–130/mo above what the
upgrades are objectively worth.

Two levers move it:
- **Free workplace charging** (Amazon L2) trims the net cost ~$26/mo → ~$296.
- **The only sub-price path is a used, pre-refresh Model Y** (−$73/mo vs the
  Kia) — but that car drops the ride, quiet, and rear screen this bundle is built
  on, so it buys a smaller bundle. See the used-MY caveat in the upgrade doc.

The willingness-to-pay defaults are starting guesses tuned to the owner's life
(high refinement weight for the highway commute, low tech/CarPlay); every line is
a live slider — the sliders are the decision, the market column is the benchmark.

## Method & confidence

**High** on the ADAS and connectivity anchors (published manufacturer
subscription prices, multi-source). **Medium** on performance, refinement,
safety, and losses — real option/trim prices exist but bundling and
attribute-isolation add noise, so each was corrected downward by the verify pass
(4 of 6 anchors were marked OVERSTATED and reduced). The $322/$213 prices and the
−$73 used-MY figure come from the project [cost model](../artifacts/upgrade-verdict.html)
and [insurance](insurance-reality-check-2026-07.md) work. The artifact's live
totals ($190 / $214 at defaults) were re-derived independently before publish.
Per [[verify-the-verifiers]], the one verifier-flagged arithmetic slip (a GM
8-year bundle mis-amortized over 60 rather than 96 months) did not affect the
$50 ADAS median, which rests on the live subscription monthlies.

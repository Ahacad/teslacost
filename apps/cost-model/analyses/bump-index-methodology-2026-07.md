# The Bump Index — an objective count of the road-bumps (MY vs Sportage)

**July 6, 2026.** Question: *how many "bumps in the road" does the 2026 Model Y
Premium AWD have over the 2025 Kia Sportage X-Line — counted objectively, not by
vibe?* This is the scoring system behind the **Bump Index** section of the
[Upgrade-Verdict artifact](../artifacts/upgrade-verdict.html). It turns the
scorecard's "6 Kia wins" into a reproducible number, then tunes it to how the car
actually gets used.

## Why a raw count is dishonest

The scorecard already tallies **9 Tesla wins / 4 washes / 6 Kia wins**. But "6
bumps" counts *no CarPlay* the same as *+$19k of depreciation*, and it counts a
towing-range collapse that never happens if you never tow. The Bump Index fixes
both: it weights each bump by how hard it bites and how often *you'd* hit it.

## The rubric

Every dimension gets one score:

```
points = side × magnitude × exposure × weight
```

| Factor | Range | Set by | Objective? |
|---|---|---|---|
| **side** | +1 boon (Tesla) / −1 bump (Kia) / 0 wash | which car wins the row | yes — from the scorecard |
| **magnitude** | 3 massive · 2 clear · 1 mild · 0 wash | the evidence (= the advantage meters) | yes — evidence-graded |
| **exposure** | 1 rare/conditional · 2 occasional · 3 constant | how often you meet it | usage-objective (your life) |
| **weight** | ×0.5 … ×1.5 by category | how much you care | your values |

`side` and `magnitude` are fixed by the verified comparison — anyone re-scoring
lands on the same numbers. `exposure` and `weight` are the two personal layers.
Flip **Equal weights** in the artifact to zero out the values layer and read the
pure objective count.

- **A bump** = a row the Kia wins (`side −1`) that applies to you (`exposure > 0`).
- **The count of bumps** is the headline answer to "how many bumps."
- **The Bump Index** is the sum of `|points|` over the bumps; **Boon Index** the
  sum over boons; **Net** = Boon − Bump.

## Your profile — what the weights were tuned to

You declined to rank abstract priorities and instead described your life; these
are the inferences drawn from it (all adjustable in the artifact):

- **60 mi/day commute to Amazon with free L2 charging** → the energy *boon* is
  near-total (your commute charges for free — stronger than the model's
  home-charging figure). Running cost weighted high (**×1.5**).
- **Seattle↔Vancouver weekends + Whistler/Rainier trips** → heavy highway miles.
  Ride, cabin quiet, and performance weighted high (**×1.5**) — that's where you
  live.
- **Android + Google Maps, and your only real CarPlay need is live-traffic nav —
  which Tesla's built-in nav has** → infotainment weighted low (**×0.6**) and the
  CarPlay bump's exposure kept at ●○○.
- **Skis on the roof rack, bikes on a hitch, no trailers** → towing off by
  default (both the tow-capability boon and the range-collapse bump sit at
  exposure 0 until you toggle "I tow").
- **Occasional forest roads, no deep snow** → ground-clearance exposure low
  (●○○); toggling "deep snow / rough off-road" raises it to ●●●.
- **Costco runs + camping gear** → the ~10 cu ft everyday-cargo bump kept at
  medium exposure (●●○).

Category weights: perf 1.5 · cost 1.5 · adas 1.25 · cargo 1.0 · safety 1.0 · own
1.0 · trip 1.0 · tech 0.6.

## The scored table (defaults: your values, FSD on)

| Dimension | Side | Mag | Exp | Wt | Points |
|---|:--:|:--:|:--:|:--:|--:|
| Acceleration & passing | boon | ●●● | ●●● | ×1.5 | **+13.5** |
| Fuel / energy cost | boon | ●●● | ●●● | ×1.5 | **+13.5** |
| Ride & refinement | boon | ●●○ | ●●● | ×1.5 | +9 |
| Cabin quiet | boon | ●●○ | ●●● | ×1.5 | +9 |
| Driver assist (ADAS)¹ | boon | ●●○ | ●●● | ×1.25 | +7.5 |
| Screens & software | boon | ●●○ | ●●● | ×0.6 | +3.6 |
| Crash safety | boon | ●○○ | ●●○ | ×1.0 | +2 |
| Cargo features | boon | ●○○ | ●●○ | ×1.0 | +2 |
| Max cargo / Reliability / Rear seat / Road trips | wash | — | — | — | 0 |
| Everyday cargo (behind row 2) | bump | ●●○ | ●●○ | ×1.0 | −4 |
| CarPlay / Android Auto | bump | ●●○ | ●○○ | ×0.6 | −1.2 |
| Depreciation | bump | ●●○ | ●●○ | ×1.5 | −6 |
| Insurance | bump | ●●○ | ●●● | ×1.5 | −9 |
| FSD subscription rent¹ | bump | ●●○ | ●●○ | ×1.5 | −6 |
| Ground clearance | bump | ●○○ | ●○○ | ×1.0 | −1 |
| Service & ownership friction | bump | ●○○ | ●●○ | ×1.0 | −2 |
| Towing capability / range collapse² | off | | | | 0 |

¹ Coupled to the FSD toggle: subscribing adds both the +7.5 ADAS boon and the −6
cost bump (net ≈ +1.5). ² Off unless "I tow" is toggled on.

## The answer

| | Bumps | Boons | Bump Index | Boon Index | Net | Boon : Bump |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **Your values** | **7** | 8 | 29.2 | 60.1 | **+30.9** | **2.06 : 1** |
| Equal weights (pure objective) | 7 | 8 | 23 | 46 | +23 | 2.0 : 1 |
| FSD dropped | 6 | 7 | 23.2 | 52.6 | +29.4 | 2.27 : 1 |

**For your life the Model Y carries 7 bumps against 8 boons, and the boons
outweigh the bumps ~2:1 — a ratio that barely moves whether you weight by your
values or treat every category equally, so it's robust.** The three heaviest
bumps are **all financial** — insurance (−9), depreciation (−6), FSD rent (−6).
The frictions switchers usually fear — towing-range loss, missing CarPlay,
ground clearance — barely register once the rubric is set to how you actually
drive.

This says nothing about whether it's *worth it*: +30.9 net "experience points"
is the upside you'd be buying, and the [cost model](../artifacts/upgrade-verdict.html)
prices that upside at ~$322/mo. The Bump Index is the non-money side of that
trade, made countable — and [`worth-it-model-2026-07.md`](worth-it-model-2026-07.md)
weighs that +30.9 against the $322/mo to answer whether it's worth it (short
version: a want, not a value — market fair value ~$214/mo).

## How to adjust

In the artifact's Bump Index section:
- **Toggle chips** flip the conditional frictions on/off (FSD, CarPlay reliance,
  deep-snow off-road, heavy cargo, towing) — exposure and the counts recompute
  live.
- **Your values / Equal weights** switches the personal weighting off, exposing
  the pure objective score.

## Method & confidence

**High** on the objective layer: `side` and `magnitude` are lifted directly from
the verified [upgrade comparison](model-y-vs-sportage-upgrade-2026-07.md) and
[cargo](cargo-space-my-vs-sportage-2026-07.md) / [insurance](insurance-reality-check-2026-07.md)
deep-dives — no new claims introduced here. **Inferred** (and adjustable): the
exposure and category weights, drawn from your described usage on 2026-07-06. The
artifact's computed totals were re-derived independently in Python before publish
(7 bumps / 8 boons / 29.2 / 60.1 / +30.9) and match the on-page numbers exactly.

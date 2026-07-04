# Insurance reality check — real Model Y quotes vs the model (July 4, 2026)

Trigger: two real 6-month full-coverage quotes for the configured 2026 Model Y
Premium AWD (~$62k OTD, Seattle):

| Carrier | 6-month quote | Monthly |
|---|---|---|
| GEICO | $3,000 | **$500/mo** |
| Progressive | $2,500 | **$417/mo** |

The model had been carrying a **$230/mo estimate** for the new-MY rows — an
all-model-years, generic-profile blend, not a quote. Real quotes replace it:
the model default is now **$417/mo** (best real quote), editable in the UI.

Everything below was researched July 4, 2026 by a 15-agent workflow (5 finders,
10 load-bearing claims adversarially verified against independent sources).

## Are the quotes fair? Market benchmarks for a NEW Model Y

| Source (date) | Figure | Scope / caveat |
|---|---|---|
| Insurify (7/2/26) | **$396/mo** | national full coverage, 2025 MY (newest listed), real quotes across 500+ insurers |
| MoneyGeek (6/11/26) | **$380/mo** | national full coverage, 2026 MY |
| insure.com / insurance.com (4/26, Quadrant) | $320/mo | national, 100/300/100, $500 deductible, 40-yo clean record — flatter mix |
| Insurify WA Model Y | $316/mo | blended coverage levels AND model years — not apples-to-apples |
| insurance.com WA Model Y | $247/mo | all model years — an older-car mix |
| Derived Seattle new-MY expectation | **~$360–380/mo** | WA MY figures × Seattle +15–17% uplift × new-MY uplift |

**Verdict: Progressive at $417/mo is essentially market rate** for a brand-new
$62k Model Y in Seattle (~5–15% over the derived band, in line with the national
new-MY averages). **GEICO at $500/mo is ~25–30% above market** — decline it.
Beware headline "Model Y averages $230–290/mo" articles: those blend old model
years and thin coverage (Insurify's blend uses $1k deductibles and sub-100/300
limits); the verifiers flagged that mismatch explicitly.

Why the car is expensive to insure: comp/collision on a $62k vehicle dominates
the premium (Model Y ≈ 1.4× an average car per Bankrate), Tesla repair costs run
high ($100–300/hr certified labor; $9–16k for a major collision; sensor
recalibration per event). It is NOT a Washington-trend effect: WA's much-cited
+17–18%/yr rate surges were 2024 filings/projections; actual 2025 WA premiums
rose only ~1.8% while the nation fell ~6% (Insurify actuals) — WA's all-vehicle
average is ~$165–183/mo. The quote level is the vehicle + a new model year.

## Cheaper paths (verified, with the refuted folk wisdom)

- **No single major is cheapest for a Model Y** — a "State Farm is cheapest"
  claim was refuted in verification. Carrier *averages* for a new MY, full
  coverage: USAA ~$187/mo (military only), GEICO $221–307/mo, State Farm
  $223–265/mo, Travelers ~$233–241/mo, Nationwide ~$229/mo, American Family
  ~$189–293/mo (study-dependent), Progressive ~$240–276/mo, Allstate high.
  The ±20% spread *between studies* is the honest uncertainty band; the move is
  to **quote 2–3 of: Travelers, Nationwide, American Family, State Farm** (and
  USAA if ever eligible). Carrier averages sit $150–230/mo below your GEICO quote.
- **Tesla Insurance is NOT available in WA** (verified vs the Seattle Times,
  7/3/26 + WA OIC on record): filing pending, proposed launch **Sept 1, 2026**
  (would be the 16th state; behavior-based monthly repricing, FSD-engaged miles
  score 100). If the switch is still on the table this fall, re-quote then.
- **Stack levers** (multiplicative, not additive): telematics (State Farm Drive
  Safe & Save / Progressive Snapshot ~10–20% realized; ~20% of Snapshot users
  see an *increase*), $1,000 deductible (~5–10% of total), bundling (6–25%,
  carrier-dependent). Realistic landing zone with a carrier switch doing most
  of the work: **$250–350/mo** — a 25–40% cut from the current quotes.

## The other cars (what the multiplier should be)

- **Kia Sportage baseline**: WA full-coverage averages $151–162/mo (MoneyGeek /
  Insurify, both verified); a 2025 MY in Seattle derives to ~$205–215/mo. The
  model's $283/mo Kia default is now an editable input — set it from your real
  statement. No Kia-theft-wave surcharge applies to a 2025 Sportage (immobilizers
  standard since late 2021; the surcharge/refusal lists hit pre-2022 builds).
- **Used Model Y (the model's "pick" rows)**: Insurify by model year: 2022
  $275/mo, 2023 $300/mo — i.e. the $230 estimate is ~×1.2–1.3 light, **not**
  the ×1.8 the new-MY quotes might suggest (insurance falls with vehicle value).

## What this does to the verdict (engine numbers, defaults otherwise)

| Scenario | 5-yr net vs keeping the Kia | Break-even |
|---|---|---|
| Your build, FSD on, ins $417 | **+$19.4k** (was +$8.1k at the $230 estimate) | never (≤96 mo) |
| Your build, FSD off, ins $417 | +$12.8k | **never** (was month 72) |
| Your build, FSD on, ins $500 (GEICO) | +$24.3k | never |
| Used MY @ 6%, ins ×1.0 ($230) | −$7.9k (switch wins) | month 19 |
| Used MY @ 6%, ins ×1.25 (~$288, realistic) | **−$4.4k** (switch still wins, thinner) | month 30 |
| Used MY @ 6%, ins ×1.8 ($414, stress) | **+$3.1k (Kia wins)** | month 85 |

Bottom line: the insurance reality check **buries the new-build case** (it was
already +$8.1k; now +$19.4k and FSD-off no longer rescues it) and **thins but
does not kill the used-MY case** (−$7.9k → ~−$4.4k at realistic used premiums).
The next load-bearing number is a **real used-MY insurance quote**; the model's
multiplier takes it directly.

## Model changes shipped with this analysis

- `S.insMy` (default **417**) — real-quote input driving both new-MY rows.
- `S.insKia` (default **283**) — editable Kia premium beside the loan fields.
- `insMult` now scales **only** the still-estimated rows (Ioniq / used MY /
  PHEV / lease); per-world real quotes are taken straight, unscaled.
- Test pins re-derived closed-form (Python) — `my099` 60-mo net $80,591
  ($1,538/mo all-in), `mystd` $90,661 ($1,729/mo); sensitivity pins at ×1.25
  and ×1.8; slider-isolation tests (each input moves only the rows it should).

## Where to quote next (verified July 4, 2026 sweep)

Second sweep (11 agents: 4 channel hunts, 7 availability/price verifications)
answering: which carriers are worth quote effort to beat Progressive's $417/mo?

**Calibration first:** every published "carrier average" below uses a
40-yr-old / clean-record / 10–12k mi/yr / 2025-model-year profile. Your real
quotes ran **~1.5× Progressive's own $276/mo average** (GEICO 2.3×) because of
the $62k new build + 23,400 mi/yr + Seattle. Apply that mentally: a $290-avg
carrier is a coin flip vs $417 *before* discounts. Realistic landing zone from
the tier-1 list: **$280–360/mo** (saves $700–1,700/yr).

### Tier 1 — quote these (three online + one phone call)

| Carrier | Signal | How |
|---|---|---|
| **PEMCO** (Seattle mutual, WA/OR only) | ~$101/mo WA full-cov average (MoneyGeek 5/26, Camry profile); confirmed Tesla appetite; caveat: topped CR's 2025 rate-increase survey | pemco.com, ~10 min direct |
| **American Family via Costco** | Cheapest MY carrier in the QuinStreet studies (~$189/mo avg, Apr 2026 — insure.com + insurance.com are the *same* dataset, not two); $293/mo Insurify avg; Costco member tier on top | costco.amfam.com (membership required; rebranded from CONNECT 12/25) |
| **Travelers** | $233/mo MY avg (QuinStreet 4/26); the only major advertising an explicit **EV discount (5–15%)** + IntelliDrive ≤30% (can surcharge in WA — drive gently the first 90 days) | travelers.com direct |
| **Nationwide** | $229/mo 2025-MY (MoneyGeek 6/11/26, cheapest mainstream in that table); SmartRide ≤40%; do NOT take SmartMiles (pay-per-mile) at 23,400 mi/yr | nationwide.com (may hand off to an agent) |

### Tier 2 — one independent-agent call covers the rest

- **Mutual of Enumclaw** — cheapest verified WA full-coverage average
  ($137/mo, ValuePenguin 6/30/26) but **agent-only**, rural-skewed book,
  +31.3% approved 2025 increase; EV appetite unknown — that's the question the
  quote answers.
- **Liberty Mutual** (Safeco brand retired Apr 2026 — agents quote it as LM
  now) + Grange/CIG as same-sitting add-ons. One Seattle independent agency
  (e.g. Secord, 206-783-4024) runs 5–8 carriers including the WA-only mutuals
  no comparison site shows.
- **State Farm** — $223–265/mo MY averages; **Drive Safe & Save is the safest
  telematics for an EV** (discount-only, no surcharge risk in WA; instant
  torque can't hurt you, though high verified mileage caps the discount).
  Needs its own agent/online quote.
- **Amica** — ~$275/mo MY avg; dividend policies return 5–20% of premium.

### Skip (verified reasons)

- **Farmers** ($447/mo MY avg — worse than your quote), **Allstate** ($347 avg,
  gap dies under your mileage/trim), **Chubb** (agreed-value luxury, not price).
- **USAA** ($187/mo, cheapest published) — military affiliation only.
- **Oregon Mutual** — exited personal lines in ALL states (2022). Dead end.
- **Lemonade** — WA is pay-per-mile-only for them; wrong product at 23,400 mi/yr
  (as is Mile Auto/Metromile atop "cheapest Tesla" listicles).
- **BECU/TruStage path** — just a ~5% referral discount on Liberty Mutual;
  redundant with the agent call. BECU's real perk is discounted AAA membership.
- **AAA Washington** — underwritten by MAPFRE; the "AAA is cheap for Teslas"
  reputation belongs to *other* AAA clubs (CSAA/SoCal) and does not transfer.
- **Progressive Snapshot** on the existing quote — avg saving ~$27/mo and ~2 in
  10 participants see an *increase*; can't close the gap to tier-1.

### Tesla Insurance (re-verified 7/4/26)

Still **not quotable in WA**: filing pending with the OIC, proposed effective
**Sept 1, 2026** (would be state #16). New from the filing: two scoring tracks
— standard Safety Score and Safety Score with FSD (Supervised), the latter
with ~10% extra off when >50% of monthly miles are FSD. Two 2026 listicles
claiming it's already live in WA are wrong (contradict the filing status).
**Play:** bind a 6-month tier-1 policy now, drive with Safety Score enabled,
re-quote Tesla in the app ~Sept 1; its monthly repricing weights mileage, so
23,400 mi/yr cuts against it.

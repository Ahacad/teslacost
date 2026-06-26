# Term-first financing — design

**Date:** 2026-06-23
**Status:** approved (brainstorm), implementing on `worktree-finance-terms`

## Problem

The whole page inherits an **8-year (96 mo) loan as the silent default**. Tesla's
configurator defaults to 96 mo, so we did too — but almost nobody actually
finances a car for 8 years, and an 8-yr loan is the *worst* deal on the page
(highest rate + most interest). Loan length is currently a buried dropdown in the
dials; the user wants it to be a **primary, prominent choice** that defaults to a
realistic term and reprices everything.

## The design

Loan term becomes the page's primary financing control, defaulting to **5 years**.

### 1. Term band (new primary control)
A `TermBand` component — a row of year chips (3 / 4 / 5 / 6 / 7 / 8 yr) — placed
**directly under the "your car" `CarFocus` panel**, above the dials. It is tied to
the selected car:
- Each chip labels the **selected car's monthly at that term** (reuses the
  existing `selectedTermQuotes` computed — no new math).
- The chip for the car's **effective term is highlighted**.
- Clicking a chip sets the page-wide term (`financeTermOverride`); the table,
  charts, and takeaways all reprice (they already read this signal).
- Footnote: the real rate range across terms (4.03% → 5.03%) and "8 yr = Tesla's
  default · most interest".

The buried "Finance term" dropdown in `Controls` is **removed** — the band
replaces it.

### 2. Realistic default
- **Canada opens on 5 yr (60 mo)**, not 96.
- **US** keeps per-trim promo terms as its default (the US prices each trim
  individually), so its default stays "per trim"; the band still works there.
- Implemented via a new optional `CostConfig.recommendedTermMonths` (CA = 60,
  US absent). `config.finance.termMonths` (96) stays as Tesla's literal default /
  the rate-ladder anchor — a separate thing from what the app opens on.

### 3. Everything follows
No new wiring needed downstream: `ScenarioTable`, `MonthlyByTrim`,
`CumulativeChart`, `EightYearChart`, and `Takeaways` already compute off
`settingsFor(vehicle)` → `financeTermOverride`. Side effect: at 5 yr the
cumulative chart's finance line goes flat (owned) at year 5, not 8.

### 4. Comparison demoted
The "Your finance terms" section (added previously) stays as the supporting
deep-dive (all terms side by side, interest, savings-vs-8yr) — reached *after*
the band, no longer the main event.

### 5. Loan term vs comparison horizon
The "over 8 years" window that compares finance/lease/cash fairly is **separate**
from the loan term and stays. Copy is tightened so "your loan term" (now 5 yr by
default) and "the 8-year comparison window" don't read as the same number.

## Data model

| Change | File |
|---|---|
| `recommendedTermMonths?: number` on `CostConfig` | `domain/types.ts` |
| `recommendedTermMonths: 60` | `data/config.ts` (CA) |
| init `financeTermOverride` from `DEFAULT_MARKET.config.recommendedTermMonths ?? null`; same on `setMarket` | `state/settings.ts` |

Effective term for the band's highlight = `financeTermOverride ?? car.finance?.termMonths ?? config.finance.termMonths`.

## Components

- **New** `ui/components/TermBand.tsx` — chips from `selectedTermQuotes`,
  highlight the selected car's effective term, click → `financeTermOverride`.
- `ui/App.tsx` — render `<TermBand/>` after `<CarFocus/>`; tighten section copy.
- `ui/components/Controls.tsx` — remove the Finance-term dropdown + its note.

## Testing

- `state`: CA opens on 60 mo; `setMarket('US')` → null (per-trim); back to CA → 60.
- `ui`: `TermBand` renders a chip per `FINANCE_TERMS`, highlights the default,
  click updates `financeTermOverride` and the highlight moves.
- Existing golden/scenario tests pass unchanged (they pass explicit settings, so
  the new default doesn't touch them). Verify visually in the live app.

## Out of scope

- Exact standard per-term rates (still need the Akamai-walled live pull; shorter
  rungs stay "est").
- The named-plans / budget-first / cost-first reframes (considered, not chosen).

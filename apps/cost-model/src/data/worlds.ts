import type { World } from '../types';

/** Resale anchor months; everything between is straight-line interpolated. */
export const MONTHS = [0, 12, 24, 36, 48, 60, 72, 96];

export const TRADE_CREDIT = 2320; // WA trade-in tax credit per dealer-trade switch
export const LEASE_PMT = 540; // flat modeled lease payment
export const GAS_MPG = 29; // Kia combined mpg
export const PHEV_MPG = 38; // PHEV highway mpg running on gas

// Line colors mirror the CSS :root palette as hex so the data layer stays
// DOM-free (pure, node-testable); the stylesheet keeps the same values.
export const WORLDS: World[] = [
  {
    key: 'kia', label: 'Keep the Kia', short: 'Kia', type: 'gas', color: '#3f4651',
    upfront: 0, principal: 30000, apr: 5.1, term: 35, insurance: 283, maint: 70,
    resale: [24000, 17000, 13000, 10000, 8000, 7000, 6000, 5000], owns: true,
    note: 'Baseline. Loan ($30k @ 5.1%) ends month 35 → after that you pay only insurance + gas + maint ($730/mo). Keeping it does NOT crystallize the ~$9k negative equity; you just keep paying. Cost is dominated by gas.',
  },
  {
    key: 'ioniq', label: 'Ioniq 5 — buy @ 0%', short: 'Ioniq 0%', type: 'ev', color: '#2f7d56', tag: 'CarPlay',
    upfront: 0, principal: 53531, apr: 0, term: 72, insurance: 200, maint: 30, tradeIn: true,
    resale: [40100, 28000, 23000, 19000, 15500, 13000, 10500, 8000], owns: true,
    note: 'Principal = $44,531 OTD (incl. WA tax) − ~$2,320 trade-in tax credit + $9,000 rolled Kia gap, financed at 0%/72. Cheapest payment of any buy, cheapest insurance, has Apple CarPlay. Catch: Hyundai depreciates fast, so you stay underwater until ~month 53.',
  },
  {
    key: 'my099', label: 'New Model Y @ 0.99%', short: 'MY 0.99%', type: 'ev', color: '#c0392b',
    upfront: 2569, principal: 64011, apr: 0.99, term: 72, insurance: 230, maint: 30, tradeIn: true,
    resale: [57580, 45000, 39000, 34000, 30000, 26000, 22000, 18000], owns: true,
    note: 'Principal = $57,580 OTD − $2,569 (5%) down + $9,000 rolled gap, at the 0.99% promo. Payment ≈ the Kia’s, holds value best, equity-positive by ~month 33. Needs ~$2.6k cash up front. No CarPlay. Interest-deduction negligible at 0.99%.',
  },
  {
    key: 'usedmy6', label: 'Used Model Y @ 6%', short: 'Used MY 6%', type: 'ev', color: '#2c6fb0',
    upfront: 0, principal: 46757, apr: 6, term: 72, insurance: 230, maint: 30, tradeIn: true,
    resale: [34000, 30000, 26000, 23000, 20000, 18000, 15500, 13000], owns: true,
    note: 'Same car as the 10% row but at a 6% APR — a BEST-CASE rate (credit-union / green-EV / captive promo). A conventional 720 buyer on a used EV more often sees ~9–10% (the other row) — treat 6% as the shop-around reward, and plan for the 6–10% band. Principal = $37,757 OTD (incl. tax) − ~$2,320 trade-in credit + $9,000 gap. The low rate makes it the cheapest payment of any Model Y and pays the $9k down faster, so walk-away-whole comes sooner than the 10% case. No CarPlay, no used-EV credit.',
  },
  {
    key: 'usedmy', label: 'Used Model Y @ ~10%', short: 'Used MY 10%', type: 'ev', color: '#1f8a8a',
    upfront: 0, principal: 46757, apr: 10, term: 72, insurance: 230, maint: 30, tradeIn: true,
    resale: [34000, 30000, 26000, 23000, 20000, 18000, 15500, 13000], owns: true,
    note: 'Principal = $37,757 OTD + $9,000 rolled gap. The pessimistic-rate row (used-EV APRs ran ~10% for a 720 buyer through 2025). 10% APR on the $9k roll keeps you deep underwater until ~month 46. Compare to the 6% row to see the rate sensitivity. No CarPlay, no used-EV credit.',
  },
  {
    key: 'phev', label: 'PHEV (RAV4-class) — est.', short: 'PHEV', type: 'phev', color: '#7a5aa3', tag: 'estimate',
    upfront: 0, principal: 59000, apr: 6, term: 72, insurance: 220, maint: 55, tradeIn: true,
    resale: [50000, 40000, 35000, 31000, 27000, 24000, 21000, 17000], owns: true,
    note: 'ESTIMATE — no hard quote. ~$50k OTD + $9k gap at ~6%/72. Weekday miles on a 120V outlet (~42 mi EV range), weekend highway on gas (~38 mpg). Lowest charging risk (no L2 dependency) but the priciest payment + slow depreciation make it the money laggard.',
  },
  {
    key: 'my627', label: 'New Model Y @ 6.27%', short: 'MY 6.27%', type: 'ev', color: '#e08e86',
    upfront: 0, principal: 66580, apr: 6.27, term: 72, insurance: 230, maint: 30, tradeIn: true,
    resale: [57580, 45000, 39000, 34000, 30000, 26000, 22000, 18000], owns: true,
    note: 'Same car, fallback rate, no down. The ~$1,070/mo payment is the killer — only beats the Kia (best energy) at ~month 77, never in the winter case. A ~23% loan-interest deduction helps ONLY if you itemize/qualify (not modeled).',
  },
  {
    key: 'lease', label: 'Ioniq 5 — lease', short: 'Lease', type: 'lease', color: '#b07d1a', tag: 'CarPlay', tagBad: 'rent',
    upfront: 0, principal: 0, apr: 0, term: 36, insurance: 200, maint: 0, owns: false,
    resale: [0, 0, 0, 0, 0, 0, 0, 0],
    note: 'POOR FIT at 23,400 mi/yr. Headline ~$259–449 assumes 12k mi/yr; ~11,400 excess miles add ~$190–240/mo, so ~$790–890/mo all-in. Looks cheap on cash because it builds ZERO equity — you own nothing and re-lease forever.',
  },
];

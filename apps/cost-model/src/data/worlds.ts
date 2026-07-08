import type { World } from '../types';

/** Resale anchor months; everything between is straight-line interpolated. */
export const MONTHS = [0, 12, 24, 36, 48, 60, 72, 96];

export const TAX_RATE = 0.1105; // Seattle vehicle sales tax (10.55% combined + 0.5% MV, Q3 2026)
export const LEASE_PMT = 540; // flat modeled lease payment
export const GAS_MPG = 29; // Kia combined mpg
export const MILES_BASE = 23400; // mi/yr the charging cases were costed at
export const PHEV_MPG = 38; // PHEV highway mpg running on gas

// The configured Model Y build (Premium AWD + options + dest/order), pre-tax.
// Tesla's promo tiers key off this: the 0.99% band requires a down payment of
// 5% of it PLUS all taxes and fees (amount financed ≤ 100% of price); financing
// past 100% LTV (taxes/fees/negative equity rolled in) prices the next band, 2.99%.
export const MY_PRETAX = 55630;
export const MY_DOWN5 = 0.05 * MY_PRETAX; // 2,781.50
export const MY_RACK = 553; // roof rack bought outside the loan, incl. tax

// Kia DEALER-TRADE value at each anchor month from now (high-mileage-adjusted,
// 2025 Sportage AWD gas; sources in analyses/ev-switch-facts). The switch-world
// rollover is financed against this, not the private curve below (`kia.resale`).
export const KIA_TRADE = [21000, 16950, 14550, 12500, 10700, 9200, 7750, 5250];

// Negative equity baked into each non-tiered switch world's `principal` at the
// curve's own month-0 value (kiaOwed 30000 − KIA_TRADE[0] 21000). The engine
// swaps this constant for the live negEquity(D), which reflects the real offer.
export const ROLL_BASE = 9000;

// Line colors mirror the CSS :root palette as hex so the data layer stays
// DOM-free (pure, node-testable); the stylesheet keeps the same values.
export const WORLDS: World[] = [
  {
    key: 'kia', label: 'Keep the Kia', short: 'Kia', type: 'gas', color: '#3f4651',
    upfront: 0, principal: 30000, apr: 5.1, term: 35, insurance: 283, maint: 70,
    resale: [24000, 19500, 16850, 14550, 12550, 10850, 9200, 6300], owns: true,
    note: 'Baseline. Loan defaults to $30k @ 5.1% with 35 months left (~$924/mo) — edit it (and the $283/mo insurance) to your real statement. After payoff you pay only insurance + gas + maint (~$660/mo at the default gas price). PRIVATE-party resale (high-mileage-adjusted): $24k now → $9.2k at 6yr. Keeping it does NOT crystallize the negative equity; you just keep paying. Cost is dominated by gas.',
  },
  {
    key: 'ioniq', label: 'Ioniq 5 — buy @ 0%', short: 'Ioniq 0%', type: 'ev', color: '#2f7d56', tag: 'CarPlay',
    upfront: 0, principal: 53531, apr: 0, term: 72, insurance: 200, maint: 30, tradeIn: true,
    resale: [40100, 28000, 23000, 19000, 15500, 13000, 10500, 8000], owns: true,
    note: 'Principal = $44,531 OTD (incl. WA tax) − ~$2,320 trade-in tax credit + $9,000 rolled Kia gap, financed at 0%/72. Cheapest payment of any buy, cheapest insurance, has Apple CarPlay. Catch: Hyundai depreciates fast, so you stay underwater until ~month 53.',
  },
  {
    key: 'my099', label: 'MY Premium AWD @ 0.99% (promo tier: 5%+tax+gap in cash)', short: 'MY 0.99%', type: 'ev', color: '#c0392b',
    tier: 'promo', upfront: 0, principal: MY_PRETAX - MY_DOWN5, apr: 0.99, term: 72, insurance: 417, maint: 30, tradeIn: true, sub: 109, otd: 61777, down: MY_DOWN5,
    resale: [55630, 46200, 40000, 34900, 30800, 26700, 22600, 18500], owns: true,
    note: 'YOUR configured car (live configurator 7/4/26, Seattle ZIP): Premium AWD $49,990 + Quicksilver $2,000 + white interior $1,000 + tow hitch $1,000 + $1,390 dest + $250 order = $55,630 pre-tax. THE PROMO TIER IS A CASH GATE: Tesla’s 0.99% band requires down ≥ 5% of price ($2,782) + ALL taxes and fees, i.e. amount financed ≤ 100% LTV — so the WA tax (11.05% of price − trade-in value), the rolled Kia gap, and the $553 roof rack are all paid in CASH at signing (upfront updates live with the offer and trade month). Financed = 95% of pre-tax price. Slide "Trade the Kia in" to see the cash gate shrink as the loan amortizes. FSD sub $99+tax ≈ $109/mo (toggle). First registration ≈ $805 + RTA ~$550/yr + $225/yr EV fees sit outside every world. Insurance = your real quote. No CarPlay.',
  },
  {
    key: 'my299', label: 'Same build @ 2.99% (roll-everything tier, $2k down)', short: 'MY 2.99%', type: 'ev', color: '#e67e22',
    tier: 'roll', upfront: 0, principal: 70777, apr: 2.99, term: 72, insurance: 417, maint: 30, tradeIn: true, sub: 109, otd: 61777, down: 2000,
    resale: [55630, 46200, 40000, 34900, 30800, 26700, 22600, 18500], owns: true,
    note: 'Identical build through Tesla’s SUB-THRESHOLD band: put ~$2k down (slider below), roll the WA tax, fees, and the Kia gap into the loan (>100% LTV), and the configurator reprices 0.99% → 2.99% — the unpublished tier verified from Tesla’s own pricing matrix (downPaymentMatrix / subventedInterestRate). Financed = $61,777 OTD − trade-in tax credit + rolled gap − down. Cash at signing = down + $553 rack only. Costs ~$4.1k more interest than the 0.99% tier over 72 mo — the price of keeping ~$8k in your pocket today. Bank must approve >100% LTV (partners cap ~120%; Tesla warns the APR "may increase"). Enforcement is inconsistent — one Feb 2026 buyer kept 0.99% with $100 down; apply and let the bank answer.',
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
    key: 'mystd', label: 'Same build @ 5.64% (standard rate)', short: 'MY 5.64%', type: 'ev', color: '#e08e86',
    upfront: 553, principal: 70777, apr: 5.64, term: 72, insurance: 417, maint: 30, tradeIn: true, sub: 109, otd: 61777, down: 0,
    resale: [55630, 46200, 40000, 34900, 30800, 26700, 22600, 18500], owns: true,
    note: 'Identical build if you miss the promo: Tesla’s standard advertised rate (5.64%/72, read off the live configurator 7/4/26; market prime average ~6.2%). No down, so principal = $61,777 OTD + $9,000 gap. The rate adds ~$180/mo over the 0.99% row — that spread IS the promo’s value (~$12k over the loan). Loan-interest deduction (≤$10k/yr, 2025–28) only survives below $100–150k MAGI single — assume $0.',
  },
  {
    key: 'lease', label: 'Ioniq 5 — lease', short: 'Lease', type: 'lease', color: '#b07d1a', tag: 'CarPlay', tagBad: 'rent',
    upfront: 0, principal: 0, apr: 0, term: 36, insurance: 200, maint: 0, owns: false,
    resale: [0, 0, 0, 0, 0, 0, 0, 0],
    note: 'POOR FIT at 23,400 mi/yr. Headline ~$259–449 assumes 12k mi/yr; ~11,400 excess miles add ~$190–240/mo, so ~$790–890/mo all-in. Looks cheap on cash because it builds ZERO equity — you own nothing and re-lease forever.',
  },
];

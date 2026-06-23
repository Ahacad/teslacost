import type { Market, RunningCosts, TaxRegion, Vehicle } from '@domain/types';

/**
 * Tesla US lineup, captured tesla.com/en_us 2026-06-22 (USD). Every finance and
 * lease figure reproduces tesla.com to the dollar — see reference/tesla_us_data_
 * 2026-06-22.md. Each trim carries its own current finance APR/term (promos
 * included) and lease money factor + residual, read off Tesla's own schedule.
 *
 * Finance: principal = base + $1,390 destination − down, amortized, pre-sales-tax.
 * Lease: residual = residualPct × (base + destination); 36 mo · 10k mi · $3k down.
 */
const US_VEHICLES: Vehicle[] = [
  // Model 3
  { key: 'm3std', name: 'Model 3 RWD', model: 'Model 3', base: 36990, financeDown: 3450, residualPct: 62, residualConfirmed: true, finance: { apr: 6.57, termMonths: 84 }, moneyFactor: 0.00012 },
  { key: 'm3prwd', name: 'Model 3 Premium RWD', model: 'Model 3', base: 42490, financeDown: 3250, residualPct: 65, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00008 },
  { key: 'm3pawd', name: 'Model 3 Premium AWD', model: 'Model 3', base: 47490, financeDown: 3250, residualPct: 61, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00004 },
  { key: 'm3perf', name: 'Model 3 Performance', model: 'Model 3', base: 54990, financeDown: 3250, residualPct: 58, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00029 },
  // Model Y
  { key: 'mystd', name: 'Model Y RWD', model: 'Model Y', base: 39990, financeDown: 3300, residualPct: 60, residualConfirmed: true, finance: { apr: 0, termMonths: 72 }, moneyFactor: 0.00131 },
  { key: 'myawd', name: 'Model Y AWD', model: 'Model Y', base: 41990, financeDown: 3300, residualPct: 62, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00185 },
  { key: 'myprwd', name: 'Model Y Premium RWD', model: 'Model Y', base: 45990, financeDown: 3300, residualPct: 61, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00231 },
  { key: 'mypawd', name: 'Model Y Premium AWD', model: 'Model Y', base: 49990, financeDown: 3300, residualPct: 60, residualConfirmed: true, finance: { apr: 0.99, termMonths: 72 }, moneyFactor: 0.00267 },
  { key: 'myperf', name: 'Model Y Performance', model: 'Model Y', base: 57990, financeDown: 3300, residualPct: 58, residualConfirmed: true, finance: { apr: 5.69, termMonths: 72 }, moneyFactor: 0.00209 },
];

/** Recurring monthly extras by model family (USD, mid-range estimates). */
const US_RUNNING: Record<string, RunningCosts> = {
  'Model 3': { connectivity: 10, charging: 35, maintenance: 40, insurance: 190 },
  'Model Y': { connectivity: 10, charging: 38, maintenance: 40, insurance: 200 },
};

/** Representative state sales-tax rates; the UI also allows a manual override. */
const US_STATES: TaxRegion[] = [
  { code: 'CA', label: 'California · 7.25%', rate: 0.0725 },
  { code: 'TX', label: 'Texas · 6.25%', rate: 0.0625 },
  { code: 'FL', label: 'Florida · 6%', rate: 0.06 },
  { code: 'WA', label: 'Washington · 6.5%', rate: 0.065 },
  { code: 'NY', label: 'New York · 4% (state)', rate: 0.04 },
  { code: 'NONE', label: 'No sales tax (OR/MT/NH)', rate: 0 },
];

export const US_MARKET: Market = {
  id: 'US',
  label: 'United States',
  flag: '🇺🇸',
  baseCurrencyCode: 'USD',
  vehicles: US_VEHICLES,
  taxRegions: US_STATES,
  config: {
    fees: 1390, // destination fee, rolled into price
    orderFee: 250, // separate non-refundable order fee, paid up front
    finance: { apr: 6.57, termMonths: 72 }, // fallback; each trim carries its own
    lease: { apr: 5.0, termMonths: 36, defaultDown: 3000, annualDistance: 10000 },
    distanceUnit: 'mi',
    taxInFinancedPrincipal: false, // US quotes are pre-tax; sales tax paid up front
    residualBasis: 'priceWithFees', // US residual % is taken on price + destination
    resale8Pct: 0.28,
    horizonMonths: 96,
    fsdPrice: 99, // FSD (Supervised) subscription/mo
    running: US_RUNNING,
  },
};

import type { CostConfig } from '@domain/types';
import { RUNNING_COSTS, DEFAULT_RUNNING } from './costs';

/**
 * Snapshot of Tesla Canada terms, 2026-06-21 (CAD). Editing these re-prices the
 * whole CA market. The finance/lease APRs and fees reproduce tesla.com's finplat.
 */
export const CONFIG: CostConfig = {
  fees: 2642, // freight/PDI + A/C + tire levies, both models, pre-tax
  orderFee: 0,
  finance: { apr: 5.03, termMonths: 96 }, // Tesla's configurator default term
  // Standard finance APR by term. Tesla CA tiers the rate by loan length, so
  // picking a shorter term lowers BOTH the principal-over-time and the rate.
  // CONFIRMED: 96 mo = 5.03% (read off tesla.com/en_ca 2026-06-21). The shorter
  // rungs are ESTIMATES (confirmed:false → "est" in the UI): Tesla CA's public
  // standard ladder brackets terms ≤60 / 72-84 / 96 in ~0.5% steps, so we hold
  // the confirmed 96-mo anchor and step down by that published shape. Replace
  // with exact values on the next live configurator pull (see reference/).
  financeSchedule: [
    { months: 36, apr: 4.03, confirmed: false },
    { months: 48, apr: 4.03, confirmed: false },
    { months: 60, apr: 4.03, confirmed: false },
    { months: 72, apr: 4.53, confirmed: false },
    { months: 84, apr: 4.53, confirmed: false },
    { months: 96, apr: 5.03, confirmed: true },
  ],
  recommendedTermMonths: 60, // open on 5 yr, not Tesla's 96-mo default
  lease: { apr: 4.9272, termMonths: 48, defaultDown: 5000, annualDistance: 16000 },
  distanceUnit: 'km',
  taxInFinancedPrincipal: true, // Canada finances provincial tax into the loan
  residualBasis: 'base', // CA residual % is taken on base price
  resale8Pct: 0.28, // estimated resale value at year 8, as % of base
  horizonMonths: 96, // shared apples-to-apples comparison window
  fsdPrice: 99, // FSD (Supervised) subscription/mo; one-time purchase ended Feb 2026
  running: RUNNING_COSTS,
  defaultRunning: DEFAULT_RUNNING,
};

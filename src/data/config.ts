import type { CostConfig } from '@domain/types';
import { RUNNING_COSTS, DEFAULT_RUNNING } from './costs';

/**
 * Snapshot of Tesla Canada terms, 2026-06-21 (CAD). Editing these re-prices the
 * whole CA market. The finance/lease APRs and fees reproduce tesla.com's finplat.
 */
export const CONFIG: CostConfig = {
  fees: 2642, // freight/PDI + A/C + tire levies, both models, pre-tax
  orderFee: 0,
  finance: { apr: 5.03, termMonths: 96 },
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

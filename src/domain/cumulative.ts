import type { ScenarioResult } from './types';

export type CumulativeKind = 'cash' | 'finance' | 'lease';

export interface CumulativePoint {
  month: number;
  total: number;
}

export interface CumulativeOptions {
  /** horizon in months (inclusive endpoint) */
  months: number;
  /** fold the monthly running/insurance/FSD extras into the curve */
  includeExtra: boolean;
  /** lease length — a new lease starts again at this month */
  leaseTermMonths: number;
}

/**
 * Cumulative cash-out-of-pocket over time, per method:
 *  - cash:    one upfront step, then flat (extras aside)
 *  - finance: down payment, then a steady climb of the monthly payment
 *  - lease:   climbs every month and steps up again at each re-lease
 */
export function cumulativePoints(
  kind: CumulativeKind,
  scenario: ScenarioResult,
  opts: CumulativeOptions,
): CumulativePoint[] {
  const ex = opts.includeExtra ? scenario.extra : 0;
  const pts: CumulativePoint[] = [];

  if (kind === 'cash') {
    const base = scenario.methods.cash.upfront;
    pts.push({ month: 0, total: base });
    for (let m = 1; m <= opts.months; m++) pts.push({ month: m, total: base + ex * m });
    return pts;
  }

  if (kind === 'finance') {
    const down = scenario.financeDown;
    const pay = scenario.methods.finance.pay;
    pts.push({ month: 0, total: down });
    for (let m = 1; m <= opts.months; m++) pts.push({ month: m, total: down + pay * m + ex * m });
    return pts;
  }

  // lease: re-lease (another down payment) every leaseTermMonths
  const upfront = scenario.methods.lease.upfront;
  const pay = scenario.methods.lease.pay;
  let acc = upfront;
  pts.push({ month: 0, total: acc });
  for (let m = 1; m <= opts.months; m++) {
    acc += pay;
    if (m % opts.leaseTermMonths === 0 && m < opts.months) acc += upfront;
    pts.push({ month: m, total: acc + ex * m });
  }
  return pts;
}

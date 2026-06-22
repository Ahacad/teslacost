import type {
  CostConfig,
  RunningCosts,
  ScenarioResult,
  ScenarioSettings,
  Vehicle,
} from './types';
import { financeMonthly } from './finance';
import { leaseMonthly } from './lease';

/** How the user chose the down payment. A bare number is an explicit amount. */
export type DownMode = 'default' | 'custom' | number;

/** Map a UI down-payment choice to a concrete amount for finance or lease. */
export function resolveDown(
  vehicle: Vehicle,
  mode: DownMode,
  custom: number,
  isLease: boolean,
  config: CostConfig,
): number {
  if (mode === 'default') return isLease ? config.lease.defaultDown : vehicle.financeDown;
  if (mode === 'custom') return custom;
  return mode;
}

const ZERO_RUNNING: RunningCosts = { connectivity: 0, charging: 0, maintenance: 0, insurance: 0 };

/**
 * Compute every method's cost for one vehicle under resolved settings.
 * Pure: depends only on its arguments, never the DOM or globals.
 */
export function computeScenario(
  vehicle: Vehicle,
  settings: ScenarioSettings,
  config: CostConfig,
): ScenarioResult {
  const priceWithFees = vehicle.base + config.fees;
  const residual = Math.round((vehicle.base * vehicle.residualPct) / 100);

  const finance = financeMonthly(
    priceWithFees,
    settings.financeDown,
    0,
    config.finance.apr,
    config.finance.termMonths,
    settings.taxRate,
  );
  const lease = leaseMonthly(
    priceWithFees,
    settings.leaseDown,
    0,
    residual,
    config.lease.apr,
    config.lease.termMonths,
    settings.taxRate,
  );
  const cashTotal = priceWithFees * (1 + settings.taxRate);

  const rc = config.running[vehicle.model] ?? ZERO_RUNNING;
  const running = settings.includeRunning ? rc.connectivity + rc.charging + rc.maintenance : 0;
  const insurance = settings.includeInsurance ? rc.insurance : 0;
  const fsd = settings.includeFsd ? settings.fsdPrice : 0;
  const extra = running + insurance + fsd;
  const resale8 = vehicle.base * config.resale8Pct;

  const fTerm = config.finance.termMonths;
  const lTerm = config.lease.termMonths;
  const financeTotal = settings.financeDown + finance.monthly * fTerm;
  const leaseUpfront = settings.leaseDown + lease.taxOnDown;
  const leaseTotal = leaseUpfront + lease.monthly * lTerm;

  return {
    vehicle,
    priceWithFees,
    residual,
    financeDown: settings.financeDown,
    leaseDown: settings.leaseDown,
    finance,
    lease,
    extra,
    running,
    insurance,
    fsd,
    resale8,
    methods: {
      finance: {
        pay: finance.monthly,
        allIn: finance.monthly + extra,
        upfront: settings.financeDown,
        totalTerm: financeTotal,
        net8: financeTotal - resale8,
      },
      lease: {
        pay: lease.monthly,
        allIn: lease.monthly + extra,
        upfront: leaseUpfront,
        totalTerm: leaseTotal,
        // two back-to-back leases over the 8-year horizon
        net8: leaseTotal * 2,
      },
      cash: {
        pay: 0,
        allIn: extra,
        upfront: cashTotal,
        totalTerm: cashTotal,
        net8: cashTotal - resale8,
      },
    },
  };
}

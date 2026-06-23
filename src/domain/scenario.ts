import type {
  CostConfig,
  RunningCosts,
  ScenarioResult,
  ScenarioSettings,
  Vehicle,
} from './types';
import { financeMonthly } from './finance';
import { leaseMonthly, aprToMoneyFactor } from './lease';

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
  const residualBasis = config.residualBasis === 'priceWithFees' ? priceWithFees : vehicle.base;
  const residual = vehicle.residual ?? Math.round((residualBasis * vehicle.residualPct) / 100);

  // Finance: a manual override wins; else the trim's own rate (US), else the
  // market default (CA). Term follows the trim when it carries one.
  const financeApr = settings.aprOverride ?? vehicle.finance?.apr ?? config.finance.apr;
  const financeTerm = vehicle.finance?.termMonths ?? config.finance.termMonths;
  // Tax is rolled into the loan only where the market finances it (CA).
  const finance = financeMonthly(
    priceWithFees,
    settings.financeDown,
    0,
    financeApr,
    financeTerm,
    config.taxInFinancedPrincipal ? settings.taxRate : 0,
  );
  // Sales tax that the market does NOT finance is paid up front instead (US).
  const financeSalesTax = config.taxInFinancedPrincipal ? 0 : settings.taxRate * priceWithFees;

  // Lease: the override maps through to a money factor; else the trim's factor
  // (US), else the market lease APR converted.
  const moneyFactor =
    settings.aprOverride != null
      ? aprToMoneyFactor(settings.aprOverride)
      : vehicle.moneyFactor ?? aprToMoneyFactor(config.lease.apr);
  const leaseTerm = config.lease.termMonths;
  const lease = leaseMonthly(
    priceWithFees,
    settings.leaseDown,
    0,
    residual,
    moneyFactor,
    leaseTerm,
    settings.taxRate,
  );

  const cashTotal = priceWithFees * (1 + settings.taxRate);
  const orderFee = config.orderFee;

  const rc = config.running[vehicle.model] ?? config.defaultRunning ?? ZERO_RUNNING;
  const running = settings.includeRunning ? rc.connectivity + rc.charging + rc.maintenance : 0;
  const insurance = settings.includeInsurance ? rc.insurance : 0;
  const fsd = settings.includeFsd ? settings.fsdPrice : 0;
  const extra = running + insurance + fsd;
  const resale8 = vehicle.base * config.resale8Pct;

  const financeUpfront = settings.financeDown + financeSalesTax + orderFee;
  const financeTotal = financeUpfront + finance.monthly * financeTerm;
  const leaseUpfront = settings.leaseDown + lease.taxOnDown + orderFee;
  const leaseTotal = leaseUpfront + lease.monthly * leaseTerm;
  const cashUpfront = cashTotal + orderFee;

  return {
    vehicle,
    priceWithFees,
    residual,
    financeDown: settings.financeDown,
    leaseDown: settings.leaseDown,
    finance,
    lease,
    financeApr,
    extra,
    running,
    insurance,
    fsd,
    resale8,
    methods: {
      finance: {
        pay: finance.monthly,
        allIn: finance.monthly + extra,
        upfront: financeUpfront,
        totalTerm: financeTotal,
        net8: financeTotal - resale8,
      },
      lease: {
        pay: lease.monthly,
        allIn: lease.monthly + extra,
        upfront: leaseUpfront,
        totalTerm: leaseTotal,
        // repeated back-to-back leases across the shared horizon
        net8: leaseTotal * (config.horizonMonths / leaseTerm),
      },
      cash: {
        pay: 0,
        allIn: extra,
        upfront: cashUpfront,
        totalTerm: cashUpfront,
        net8: cashUpfront - resale8,
      },
    },
  };
}

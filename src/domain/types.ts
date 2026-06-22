// Domain types. Pure data — no DOM, no framework. All monetary amounts are in
// the base currency (CAD) unless a `*Display` name says otherwise.

export interface Vehicle {
  /** stable id, e.g. "m3rwd" */
  key: string;
  /** display name, e.g. "Model 3 Premium RWD" */
  name: string;
  /** model family, e.g. "Model 3" — keys into running-cost tables */
  model: string;
  /** base price before fees, in base currency */
  base: number;
  /** Tesla's default finance down payment */
  financeDown: number;
  /** lease residual as a percentage of `base` (e.g. 41.5) */
  residualPct: number;
  /** false when the residual is an estimate (flag in the UI) */
  residualConfirmed: boolean;
}

/** Recurring monthly extras for a model family, in base currency. */
export interface RunningCosts {
  connectivity: number;
  charging: number;
  maintenance: number;
  insurance: number;
}

export interface LoanTerms {
  /** annual percentage rate, in percent (e.g. 5.03) */
  apr: number;
  termMonths: number;
}

export interface FinanceResult {
  /** tax-inclusive monthly payment */
  monthly: number;
  monthlyPreTax: number;
  /** amount financed, incl. rolled-in tax */
  principal: number;
  tax: number;
}

export interface LeaseResult {
  /** tax-inclusive monthly payment */
  monthly: number;
  monthlyPreTax: number;
  depreciation: number;
  rent: number;
  moneyFactor: number;
  adjustedCap: number;
  /** sales tax charged once on the lease down payment */
  taxOnDown: number;
}

/** A per-method cost summary (finance | lease | cash). */
export interface MethodResult {
  /** financing payment per month, tax incl. (0 for cash) */
  pay: number;
  /** pay + chosen running/insurance/FSD extras */
  allIn: number;
  /** cash needed up front */
  upfront: number;
  /** car-only total over the financing term */
  totalTerm: number;
  /** fair 8-year cost, net of resale where the car is kept */
  net8: number;
}

export interface ScenarioResult {
  vehicle: Vehicle;
  priceWithFees: number;
  residual: number;
  financeDown: number;
  leaseDown: number;
  finance: FinanceResult;
  lease: LeaseResult;
  /** sum of the monthly extras the user chose to count */
  extra: number;
  running: number;
  insurance: number;
  fsd: number;
  resale8: number;
  methods: {
    finance: MethodResult;
    lease: MethodResult;
    cash: MethodResult;
  };
}

/** Resolved per-scenario inputs (down amounts already chosen). */
export interface ScenarioSettings {
  taxRate: number;
  financeDown: number;
  leaseDown: number;
  includeRunning: boolean;
  includeInsurance: boolean;
  includeFsd: boolean;
  fsdPrice: number;
}

export interface CostConfig {
  fees: number;
  finance: LoanTerms;
  lease: LoanTerms & { defaultDown: number; annualKm: number };
  resale8Pct: number;
  horizonMonths: number;
  fsdPrice: number;
  /** running costs keyed by model family */
  running: Record<string, RunningCosts>;
}

/** A currency definition. Rates are expressed as units per 1 unit of base. */
export interface Currency {
  code: string;
  symbol: string;
  locale: string;
}

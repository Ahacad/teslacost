// Domain types. Pure data — no DOM, no framework. All monetary amounts are in a
// market's base currency (CAD for Canada, USD for the US) unless a `*Display`
// name says otherwise.

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
  /** lease residual as a percentage of the market's residual basis (e.g. 41.5) */
  residualPct: number;
  /** exact residual read off Tesla's lease tab, in dollars; overrides residualPct */
  residual?: number;
  /** false when the residual is an estimate (flag in the UI) */
  residualConfirmed: boolean;
  /**
   * Per-trim finance terms. When present (US), overrides the market's finance
   * config — markets like the US price each trim's APR/term individually
   * (promos). When absent (CA), the market `config.finance` applies.
   */
  finance?: LoanTerms;
  /**
   * Per-trim lease money factor (US). When present it is used directly; when
   * absent the market lease APR is converted (`apr / 2400`).
   */
  moneyFactor?: number;
  /** optional per-trim 3D asset overrides; absent → the model-family default */
  glb?: string;
  poster?: string;
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

/**
 * One rung of a market's finance rate-by-term ladder. Tesla Canada prices the
 * APR by loan length (longer term → higher rate), so the rate depends on the
 * term you pick — not one flat number across all terms. `confirmed` is false for
 * a rung estimated rather than read off tesla.com (flagged "est" in the UI),
 * mirroring `Vehicle.residualConfirmed`.
 */
export interface FinanceTermRate {
  months: number;
  /** annual percentage rate, in percent */
  apr: number;
  confirmed: boolean;
}

/** A finance quote for one term length, for the rate-by-term comparison. */
export interface TermQuote {
  months: number;
  apr: number;
  /** false when the APR is an estimate (rung not yet read off tesla.com) */
  confirmed: boolean;
  /** monthly payment, on the same tax basis as the main table */
  monthly: number;
  /** every payment summed over the term (car only, excl. down) */
  totalPaid: number;
  /** total interest handed to the lender over the term */
  interest: number;
}

export interface FinanceResult {
  /** tax-inclusive monthly payment (equals pre-tax when tax isn't financed) */
  monthly: number;
  monthlyPreTax: number;
  /** amount financed, incl. rolled-in tax where the market finances it */
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
  /** effective finance APR used (after any manual override), in percent */
  financeApr: number;
  /** false when `financeApr` came from an estimated rate-ladder rung */
  financeAprConfirmed: boolean;
  /** effective finance term used (after any manual override), in months */
  financeTerm: number;
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
  /** manual APR override in percent; null = use each trim's real rate */
  aprOverride: number | null;
  /** manual finance term override in months; null = use each trim's own term */
  financeTermOverride: number | null;
}

export interface CostConfig {
  /** mandatory fees rolled into the price (CA freight/PDI; US destination) */
  fees: number;
  /** separate non-refundable upfront fee not rolled into price (US order fee) */
  orderFee: number;
  finance: LoanTerms;
  /**
   * CA: standard finance APR by term length. When present, the chosen term's
   * rate is used instead of the flat `finance.apr`. Absent for the US, where
   * each trim carries its own promo `finance.apr` regardless of term.
   */
  financeSchedule?: FinanceTermRate[];
  /**
   * The loan term the app opens on — a realistic length, NOT Tesla's 96-mo
   * configurator default (`finance.termMonths`). Absent where the market prices
   * each trim's term individually (US), so it opens on the trim's own term.
   */
  recommendedTermMonths?: number;
  lease: LoanTerms & { defaultDown: number; annualDistance: number };
  /** distance-allowance unit for the lease line */
  distanceUnit: 'km' | 'mi';
  /** whether sales tax is financed into the loan (CA) or paid separately (US) */
  taxInFinancedPrincipal: boolean;
  /** what the lease residual percentage is taken on */
  residualBasis: 'base' | 'priceWithFees';
  resale8Pct: number;
  horizonMonths: number;
  fsdPrice: number;
  /** running costs keyed by model family */
  running: Record<string, RunningCosts>;
  /** fallback running costs for a model family with no explicit row */
  defaultRunning?: RunningCosts;
}

/** A taxing region — a Canadian province or a US state. */
export interface TaxRegion {
  code: string;
  label: string;
  rate: number;
  /** price-dependent combined rate (e.g. BC's luxury PST); overrides `rate` */
  rateFor?: (priceWithFees: number) => number;
}

/** A self-contained market: its own lineup, terms, taxes, and base currency. */
export interface Market {
  /** stable id, e.g. "CA" | "US" */
  id: string;
  /** short label, e.g. "Canada" */
  label: string;
  /** ISO code of the currency all this market's amounts are stored in */
  baseCurrencyCode: string;
  vehicles: Vehicle[];
  config: CostConfig;
  /** selectable tax regions */
  taxRegions: TaxRegion[];
  /** region code selected when this market loads; falls back to taxRegions[0] */
  defaultTaxRegionCode?: string;
}

/** A currency definition. Rates are expressed as units per 1 unit of base. */
export interface Currency {
  code: string;
  symbol: string;
  locale: string;
}

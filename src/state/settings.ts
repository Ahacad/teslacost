import { signal, computed } from '@preact/signals';
import type { Currency, ScenarioSettings, Vehicle } from '@domain/types';
import { computeScenario, resolveDown, financeTermQuotes, type DownMode } from '@domain/scenario';
import type { Market } from '@domain/types';
import { MARKETS, DEFAULT_MARKET, marketById } from '@data/markets';
import { regionByCode, regionRate } from '@data/tax';
import { CURRENCIES, FALLBACK_RATES, currencyByCode } from '@data/currencies';

export { MARKETS };

/** The tax region a market opens on: its declared default, else the first listed. */
const defaultRegionCode = (m: Market): string =>
  m.defaultTaxRegionCode ?? m.taxRegions[0].code;

// ---- market ----
export const marketId = signal(DEFAULT_MARKET.id);
export const activeMarket = computed(() => marketById(marketId.value));

// ---- raw UI state (money values are in the active market's base currency) ----
// Tax: pick a region (its rate may be price-tiered, e.g. BC's luxury PST) or
// type a manual % that wins for every trim. The effective rate is resolved per
// vehicle in settingsFor; `taxRate` here is the headline shown in the UI.
export const taxRegionCode = signal(defaultRegionCode(DEFAULT_MARKET));
export const taxOverride = signal<number | null>(null);
export const activeTaxRegion = computed(() =>
  regionByCode(activeMarket.value.taxRegions, taxRegionCode.value),
);
export const taxRate = computed(() => taxOverride.value ?? activeTaxRegion.value.rate);
export const downMode = signal<DownMode>('default');
export const customDown = signal(5000);
export const includeRunning = signal(true);
export const includeInsurance = signal(true);
export const includeFsd = signal(false);
export const fsdPrice = signal(DEFAULT_MARKET.config.fsdPrice);
/** manual finance APR override in percent; null = use each trim's real rate */
export const aprOverride = signal<number | null>(null);
/**
 * The page-wide loan term, in months. Opens on the market's realistic
 * recommended term (CA = 60 mo / 5 yr), NOT Tesla's 96-mo default. null falls
 * back to each trim's own term (US, which prices terms per trim).
 */
export const financeTermOverride = signal<number | null>(
  DEFAULT_MARKET.config.recommendedTermMonths ?? null,
);
/** Common finance lengths Tesla offers; the shortest/longest bracket reality. */
export const FINANCE_TERMS = [36, 48, 60, 72, 84, 96];

// ---- currency / FX ----
export const currencyCode = signal(DEFAULT_MARKET.baseCurrencyCode);
/** rates expressed as units per 1 CAD (the FX feed's pivot); replaced live */
export const rates = signal<Record<string, number>>({ ...FALLBACK_RATES });

export const activeCurrency = computed<Currency>(
  () => currencyByCode(currencyCode.value) ?? CURRENCIES[0],
);

/**
 * Display units per 1 unit of the active market's base currency. The feed is
 * keyed per CAD, so we cross-rate: `rate[display] / rate[base]`. CA (base CAD)
 * collapses to `rate[display]`; US (base USD) divides through USD.
 */
export const activeRate = computed<number>(() => {
  const r = rates.value;
  const baseCode = activeMarket.value.baseCurrencyCode;
  const disp = r[currencyCode.value] ?? FALLBACK_RATES[currencyCode.value] ?? 1;
  const base = r[baseCode] ?? FALLBACK_RATES[baseCode] ?? 1;
  return disp / base;
});

export function setCurrency(code: string): void {
  currencyCode.value = code;
}

/** Manually set a currency's rate (units per CAD), e.g. from the FX input. */
export function setRate(code: string, rate: number): void {
  rates.value = { ...rates.value, [code]: rate };
}

/** Switch markets, resetting market-scoped dials to the new market's defaults. */
export function setMarket(id: string): void {
  const m = marketById(id);
  marketId.value = id;
  taxRegionCode.value = defaultRegionCode(m);
  taxOverride.value = null;
  currencyCode.value = m.baseCurrencyCode;
  downMode.value = 'default';
  fsdPrice.value = m.config.fsdPrice;
  aprOverride.value = null;
  financeTermOverride.value = m.config.recommendedTermMonths ?? null;
  selectedVehicleKey.value = m.vehicles[0].key;
}

// ---- derived scenario settings + results ----
export function settingsFor(vehicle: Vehicle): ScenarioSettings {
  const config = activeMarket.value.config;
  return {
    taxRate: taxOverride.value ?? regionRate(activeTaxRegion.value, vehicle.base + config.fees),
    financeDown: resolveDown(vehicle, downMode.value, customDown.value, false, config),
    leaseDown: resolveDown(vehicle, downMode.value, customDown.value, true, config),
    includeRunning: includeRunning.value,
    includeInsurance: includeInsurance.value,
    includeFsd: includeFsd.value,
    fsdPrice: fsdPrice.value,
    aprOverride: aprOverride.value,
    financeTermOverride: financeTermOverride.value,
  };
}

/** Every vehicle's full cost breakdown — recomputes when any dial moves. */
export const scenarios = computed(() =>
  activeMarket.value.vehicles.map((v) =>
    computeScenario(v, settingsFor(v), activeMarket.value.config),
  ),
);

export const scenarioByKey = (key: string) =>
  scenarios.value.find((s) => s.vehicle.key === key) ?? scenarios.value[0];

// ---- selected trim (the "your car" focus) ----
export const selectedVehicleKey = signal(DEFAULT_MARKET.vehicles[0].key);
export const selectedScenario = computed(() => scenarioByKey(selectedVehicleKey.value));

/** Finance quotes for the selected car across every term — the rate-by-term view. */
export const selectedTermQuotes = computed(() => {
  const v = selectedScenario.value.vehicle;
  return financeTermQuotes(v, settingsFor(v), activeMarket.value.config, FINANCE_TERMS);
});

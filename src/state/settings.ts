import { signal, computed } from '@preact/signals';
import type { Currency, ScenarioSettings, Vehicle } from '@domain/types';
import { computeScenario, resolveDown, type DownMode } from '@domain/scenario';
import { MARKETS, DEFAULT_MARKET, marketById } from '@data/markets';
import { CURRENCIES, FALLBACK_RATES, currencyByCode } from '@data/currencies';

export { MARKETS };

// ---- market ----
export const marketId = signal(DEFAULT_MARKET.id);
export const activeMarket = computed(() => marketById(marketId.value));

// ---- raw UI state (money values are in the active market's base currency) ----
export const taxRate = signal(DEFAULT_MARKET.defaultTaxRate);
export const downMode = signal<DownMode>('default');
export const customDown = signal(5000);
export const includeRunning = signal(true);
export const includeInsurance = signal(true);
export const includeFsd = signal(false);
export const fsdPrice = signal(DEFAULT_MARKET.config.fsdPrice);
/** manual finance APR override in percent; null = use each trim's real rate */
export const aprOverride = signal<number | null>(null);

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
  taxRate.value = m.defaultTaxRate;
  currencyCode.value = m.baseCurrencyCode;
  downMode.value = 'default';
  fsdPrice.value = m.config.fsdPrice;
  aprOverride.value = null;
}

// ---- derived scenario settings + results ----
export function settingsFor(vehicle: Vehicle): ScenarioSettings {
  const config = activeMarket.value.config;
  return {
    taxRate: taxRate.value,
    financeDown: resolveDown(vehicle, downMode.value, customDown.value, false, config),
    leaseDown: resolveDown(vehicle, downMode.value, customDown.value, true, config),
    includeRunning: includeRunning.value,
    includeInsurance: includeInsurance.value,
    includeFsd: includeFsd.value,
    fsdPrice: fsdPrice.value,
    aprOverride: aprOverride.value,
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

import { signal, computed } from '@preact/signals';
import type { Currency, ScenarioSettings, Vehicle } from '@domain/types';
import { computeScenario, resolveDown, type DownMode } from '@domain/scenario';
import { CONFIG } from '@data/config';
import { VEHICLES } from '@data/vehicles';
import { DEFAULT_PROVINCE } from '@data/tax';
import {
  BASE_CURRENCY_CODE,
  CURRENCIES,
  FALLBACK_RATES,
  currencyByCode,
} from '@data/currencies';

// ---- raw UI state (all money values are in the base currency, CAD) ----
export const taxRate = signal(DEFAULT_PROVINCE.rate);
export const downMode = signal<DownMode>('default');
export const customDown = signal(5000);
export const includeRunning = signal(true);
export const includeInsurance = signal(true);
export const includeFsd = signal(false);
export const fsdPrice = signal(CONFIG.fsdPrice);

// ---- currency / FX ----
export const currencyCode = signal(BASE_CURRENCY_CODE);
/** rates expressed as units per 1 CAD; seeded with fallbacks, replaced live */
export const rates = signal<Record<string, number>>({ ...FALLBACK_RATES });

export const activeCurrency = computed<Currency>(
  () => currencyByCode(currencyCode.value) ?? CURRENCIES[0],
);

export const activeRate = computed<number>(() => {
  if (currencyCode.value === BASE_CURRENCY_CODE) return 1;
  return rates.value[currencyCode.value] ?? FALLBACK_RATES[currencyCode.value] ?? 1;
});

export function setCurrency(code: string): void {
  currencyCode.value = code;
}

/** Manually set a currency's rate (units per CAD), e.g. from the FX input. */
export function setRate(code: string, rate: number): void {
  rates.value = { ...rates.value, [code]: rate };
}

// ---- derived scenario settings + results ----
export function settingsFor(vehicle: Vehicle): ScenarioSettings {
  return {
    taxRate: taxRate.value,
    financeDown: resolveDown(vehicle, downMode.value, customDown.value, false, CONFIG),
    leaseDown: resolveDown(vehicle, downMode.value, customDown.value, true, CONFIG),
    includeRunning: includeRunning.value,
    includeInsurance: includeInsurance.value,
    includeFsd: includeFsd.value,
    fsdPrice: fsdPrice.value,
  };
}

/** Every vehicle's full cost breakdown — recomputes when any dial moves. */
export const scenarios = computed(() =>
  VEHICLES.map((v) => computeScenario(v, settingsFor(v), CONFIG)),
);

export const scenarioByKey = (key: string) =>
  scenarios.value.find((s) => s.vehicle.key === key) ?? scenarios.value[0];

import type { Currency } from '@domain/types';

/**
 * Currencies the UI can display. All vehicle data is stored in the base
 * currency (CAD); every other currency is rendered by converting at a live or
 * fallback FX rate (see state/fx.ts).
 *
 * Adding a currency = appending one entry here + ensuring an FX rate is
 * available (the open.er-api.com feed already returns every ISO code).
 */
export const BASE_CURRENCY_CODE = 'CAD';

export const CURRENCIES: Currency[] = [
  { code: 'CAD', symbol: '$', locale: 'en-CA' },
  { code: 'USD', symbol: '$', locale: 'en-US' },
];

/** Last-known fallback rates (units per 1 CAD), used until the live fetch lands. */
export const FALLBACK_RATES: Record<string, number> = {
  CAD: 1,
  USD: 0.7068,
};

export const currencyByCode = (code: string): Currency | undefined =>
  CURRENCIES.find((c) => c.code === code);

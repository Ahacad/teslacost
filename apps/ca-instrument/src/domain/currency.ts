import type { Currency } from './types';

/** Convert a base-currency amount to a target currency at `rate` (units/base). */
export function convert(amountBase: number, rate: number): number {
  return amountBase * rate;
}

/** Inverse of {@link convert}: a target-currency amount back to base. */
export function toBase(amount: number, rate: number): number {
  return amount / rate;
}

/**
 * Format a base-currency amount in `currency`, rounded to whole units, with
 * locale-aware grouping. The symbol is taken from the currency definition so
 * adding a currency is purely declarative.
 */
export function formatMoney(amountBase: number, currency: Currency, rate: number): string {
  const value = Math.round(convert(amountBase, rate));
  return currency.symbol + value.toLocaleString(currency.locale);
}

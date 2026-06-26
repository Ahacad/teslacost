import { formatMoney, convert, toBase } from '@domain/currency';
import { activeCurrency, activeRate } from './settings';

/**
 * Format a base-currency amount in the active currency. Reading the `.value`
 * signals here subscribes any component that calls `money()` to currency/FX
 * changes, so amounts re-render automatically.
 */
export const money = (amountBase: number): string =>
  formatMoney(amountBase, activeCurrency.value, activeRate.value);

/** Whole-number display value in the active currency (for input fields). */
export const display = (amountBase: number): number =>
  Math.round(convert(amountBase, activeRate.value));

/** Convert a value typed in the active currency back to base (CAD). */
export const toBaseValue = (amountDisplay: number): number =>
  toBase(amountDisplay, activeRate.value);

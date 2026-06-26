import { describe, it, expect } from 'vitest';
import { convert, toBase, formatMoney } from '@domain/currency';
import type { Currency } from '@domain/types';

const CAD: Currency = { code: 'CAD', symbol: '$', locale: 'en-CA' };
const USD: Currency = { code: 'USD', symbol: '$', locale: 'en-US' };
const EUR: Currency = { code: 'EUR', symbol: '€', locale: 'de-DE' };

describe('currency conversion', () => {
  it('converts from base at the given rate', () => {
    expect(convert(100, 0.7068)).toBeCloseTo(70.68, 6);
  });

  it('toBase is the inverse of convert (round-trip identity)', () => {
    const rate = 0.7068;
    for (const n of [0, 1, 833, 36552, 88000]) {
      expect(toBase(convert(n, rate), rate)).toBeCloseTo(n, 6);
    }
  });

  it('a rate of 1 is identity (base currency)', () => {
    expect(convert(1234, 1)).toBe(1234);
    expect(toBase(1234, 1)).toBe(1234);
  });
});

describe('money formatting', () => {
  it('rounds and renders with the currency symbol', () => {
    expect(formatMoney(833, CAD, 1)).toBe('$833');
  });

  it('applies the rate before formatting', () => {
    // 833 CAD @ 0.7068 -> 589 USD
    expect(formatMoney(833, USD, 0.7068)).toBe('$589');
  });

  it('supports a non-dollar currency and locale grouping', () => {
    const out = formatMoney(36552, EUR, 0.65);
    expect(out.startsWith('€')).toBe(true);
    // 36552 * 0.65 = 23759, grouped per locale
    expect(out).toMatch(/23.?759/);
  });
});

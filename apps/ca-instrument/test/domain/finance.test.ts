import { describe, it, expect } from 'vitest';
import { financeMonthly } from '@domain/finance';

const FEES = 2642;
const APR = 5.03;
const TERM = 96;

// Golden set: Tesla's own pre-tax monthly figures, captured from
// tesla.com/en_ca (finplat) 2026-06-21. These lock "matches to the dollar".
describe('financeMonthly — tesla.com golden numbers (pre-tax)', () => {
  const cases: Array<[string, number, number, number]> = [
    // label, base price, down, expected pre-tax monthly
    ['Model 3 RWD', 39490, 4300, 479],
    ['Model 3 AWD', 49990, 4300, 613],
    ['Model 3 Performance', 74990, 4300, 929],
    ['Model Y RWD', 49990, 5150, 602],
  ];
  for (const [label, base, down, expected] of cases) {
    it(`${label} ≈ $${expected}/mo`, () => {
      const r = financeMonthly(base + FEES, down, 0, APR, TERM, 0);
      expect(Math.abs(r.monthlyPreTax - expected)).toBeLessThan(2);
    });
  }
});

describe('financeMonthly — tax handling', () => {
  it('rolls provincial tax into the financed principal', () => {
    const ppf = 39490 + FEES;
    const taxRate = 0.13;
    const r = financeMonthly(ppf, 4300, 0, APR, TERM, taxRate);
    expect(r.tax).toBeCloseTo(taxRate * ppf, 6);
    expect(r.principal).toBeCloseTo(ppf + r.tax - 4300, 6);
    expect(r.monthly).toBeGreaterThan(r.monthlyPreTax);
  });

  it('more down payment lowers the monthly', () => {
    const ppf = 39490 + FEES;
    const lo = financeMonthly(ppf, 0, 0, APR, TERM, 0.13).monthly;
    const hi = financeMonthly(ppf, 10000, 0, APR, TERM, 0.13).monthly;
    expect(hi).toBeLessThan(lo);
  });

  it('handles a 0% APR as straight-line principal/term', () => {
    const r = financeMonthly(48000, 0, 0, 0, 96, 0);
    expect(r.monthly).toBeCloseTo(500, 6);
  });
});

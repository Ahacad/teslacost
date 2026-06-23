import { describe, it, expect } from 'vitest';
import { leaseMonthly, aprToMoneyFactor } from '@domain/lease';

const FEES = 2642;
const APR = 4.9272;
const TERM = 48;

// Golden set: Tesla's own pre-tax lease monthlies, tesla.com/en_ca 2026-06-21.
// Fidelity note: M3 RWD uses Tesla's directly-read residual ($16,377) and the
// public formula lands ~$3 above finplat's shown $539 (money-factor rounding
// inside Tesla's engine). AWD/Perf residuals were back-solved from captured
// payments, so they reproduce exactly. Tolerance ≤$4 reflects that real gap;
// finance, by contrast, is exact to the dollar.
describe('leaseMonthly — tesla.com golden numbers (pre-tax)', () => {
  const cases: Array<[string, number, number, number]> = [
    // label, base, residual($), tesla.com displayed monthly
    ['Model 3 RWD', 39490, 16377, 539],
    ['Model 3 AWD', 49990, Math.round(49990 * 0.449), 669],
    ['Model 3 Performance', 74990, Math.round(74990 * 0.435), 1049],
  ];
  for (const [label, base, residual, expected] of cases) {
    it(`${label} within $4 of $${expected}/mo`, () => {
      const r = leaseMonthly(base + FEES, 5000, 0, residual, aprToMoneyFactor(APR), TERM, 0);
      expect(Math.abs(r.monthlyPreTax - expected)).toBeLessThan(4);
    });
  }
});

describe('leaseMonthly — money factor & tax', () => {
  it('derives the money factor as APR/2400 (not APR/100/2400)', () => {
    // The classic bug: dividing by 100 twice. MF must be ~0.002053.
    expect(aprToMoneyFactor(APR)).toBeCloseTo(APR / 2400, 9);
    expect(aprToMoneyFactor(APR)).toBeGreaterThan(0.002);
    const r = leaseMonthly(42132, 5000, 0, 16377, aprToMoneyFactor(APR), TERM, 0);
    expect(r.moneyFactor).toBeCloseTo(APR / 2400, 9);
  });

  it('taxes the payments but charges tax once on the down', () => {
    const taxRate = 0.13;
    const r = leaseMonthly(42132, 5000, 0, 16377, aprToMoneyFactor(APR), TERM, taxRate);
    expect(r.monthly).toBeCloseTo(r.monthlyPreTax * (1 + taxRate), 6);
    expect(r.taxOnDown).toBeCloseTo(5000 * taxRate, 6);
  });

  it('splits the payment into depreciation + rent', () => {
    const r = leaseMonthly(42132, 5000, 0, 16377, aprToMoneyFactor(APR), TERM, 0);
    expect(r.monthlyPreTax).toBeCloseTo(r.depreciation + r.rent, 6);
    expect(r.adjustedCap).toBeCloseTo(42132 - 5000, 6);
  });
});

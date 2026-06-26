import { describe, it, expect } from 'vitest';
import { computeScenario, resolveDown } from '@domain/scenario';
import type { ScenarioSettings } from '@domain/types';
import { CONFIG } from '@data/config';
import { vehicleByKey } from '@data/vehicles';

const m3rwd = vehicleByKey('m3rwd')!;

function settings(over: Partial<ScenarioSettings> = {}): ScenarioSettings {
  return {
    taxRate: 0.13,
    financeDown: m3rwd.financeDown,
    leaseDown: CONFIG.lease.defaultDown,
    includeRunning: false,
    includeInsurance: false,
    includeFsd: false,
    fsdPrice: CONFIG.fsdPrice,
    aprOverride: null,
    financeTermOverride: null,
    ...over,
  };
}

describe('resolveDown', () => {
  it('uses the vehicle finance default / lease default for "default"', () => {
    expect(resolveDown(m3rwd, 'default', 0, false, CONFIG)).toBe(4300);
    expect(resolveDown(m3rwd, 'default', 0, true, CONFIG)).toBe(5000);
  });
  it('uses the custom amount for "custom"', () => {
    expect(resolveDown(m3rwd, 'custom', 7500, false, CONFIG)).toBe(7500);
  });
  it('uses an explicit number verbatim', () => {
    expect(resolveDown(m3rwd, 0, 0, false, CONFIG)).toBe(0);
    expect(resolveDown(m3rwd, 10000, 0, true, CONFIG)).toBe(10000);
  });
});

describe('computeScenario — Model 3 RWD, Ontario, default down', () => {
  const r = computeScenario(m3rwd, settings(), CONFIG);

  it('prices fees in', () => {
    expect(r.priceWithFees).toBe(39490 + 2642);
    expect(r.residual).toBe(16377); // Tesla's read-off residual, not round(base*41.5%)
  });
  it('finance tax-incl monthly ≈ $549', () => {
    expect(Math.abs(r.methods.finance.pay - 549)).toBeLessThan(1.5);
  });
  it('lease tax-incl monthly ≈ $613', () => {
    expect(Math.abs(r.methods.lease.pay - 613)).toBeLessThan(1.5);
  });
  it('cash upfront is price+fees including tax', () => {
    expect(r.methods.cash.upfront).toBeCloseTo(r.priceWithFees * 1.13, 6);
  });
  it('lease taxes the down once into upfront', () => {
    expect(r.methods.lease.upfront).toBeCloseTo(5000 + 5000 * 0.13, 6);
  });
  it('8-yr lease net is two terms', () => {
    expect(r.methods.lease.net8).toBeCloseTo(r.methods.lease.totalTerm * 2, 6);
  });
  it('8-yr finance net banks the resale value', () => {
    expect(r.methods.finance.net8).toBeCloseTo(
      r.methods.finance.totalTerm - 39490 * 0.28,
      6,
    );
  });
});

describe('computeScenario — extras toggles', () => {
  it('all-in equals pay when nothing is included', () => {
    const r = computeScenario(m3rwd, settings(), CONFIG);
    expect(r.methods.finance.allIn).toBeCloseTo(r.methods.finance.pay, 6);
    expect(r.extra).toBe(0);
  });
  it('FSD adds its price to every all-in', () => {
    const off = computeScenario(m3rwd, settings(), CONFIG);
    const on = computeScenario(m3rwd, settings({ includeFsd: true }), CONFIG);
    expect(on.methods.finance.allIn - off.methods.finance.allIn).toBeCloseTo(99, 6);
    expect(on.methods.cash.allIn).toBeCloseTo(99, 6);
  });
  it('running + insurance stack onto cash all-in', () => {
    const r = computeScenario(
      m3rwd,
      settings({ includeRunning: true, includeInsurance: true }),
      CONFIG,
    );
    // M3: connectivity 14 + charging 30 + maint 40 + insurance 200 = 284
    expect(r.methods.cash.allIn).toBeCloseTo(284, 6);
  });
});

describe('computeScenario — down sensitivity', () => {
  it('more down lowers finance monthly', () => {
    const lo = computeScenario(m3rwd, settings({ financeDown: 0 }), CONFIG);
    const hi = computeScenario(m3rwd, settings({ financeDown: 10000 }), CONFIG);
    expect(hi.methods.finance.pay).toBeLessThan(lo.methods.finance.pay);
  });
});

describe('computeScenario — finance term override', () => {
  it('reports the market term when no override is set', () => {
    expect(computeScenario(m3rwd, settings(), CONFIG).financeTerm).toBe(96);
  });
  it('a chosen term overrides the default and raises the monthly', () => {
    const long = computeScenario(m3rwd, settings(), CONFIG);
    const short = computeScenario(m3rwd, settings({ financeTermOverride: 36 }), CONFIG);
    expect(short.financeTerm).toBe(36);
    expect(short.methods.finance.pay).toBeGreaterThan(long.methods.finance.pay);
  });
  it('total over the loan sums exactly the override term of payments', () => {
    const r = computeScenario(m3rwd, settings({ financeTermOverride: 60 }), CONFIG);
    expect(r.methods.finance.totalTerm).toBeCloseTo(
      r.methods.finance.upfront + r.methods.finance.pay * 60,
      6,
    );
  });
});

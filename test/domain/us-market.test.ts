import { describe, it, expect } from 'vitest';
import { computeScenario, resolveDown } from '@domain/scenario';
import type { ScenarioSettings, Vehicle } from '@domain/types';
import { US_MARKET } from '@data/markets/us';

const cfg = US_MARKET.config;
const byKey = (k: string): Vehicle => US_MARKET.vehicles.find((v) => v.key === k)!;

/** Pre-tax settings with Tesla's default downs — the basis of the quotes. */
function settings(v: Vehicle, over: Partial<ScenarioSettings> = {}): ScenarioSettings {
  return {
    taxRate: 0, // Tesla's US quotes exclude sales tax
    financeDown: resolveDown(v, 'default', 0, false, cfg),
    leaseDown: resolveDown(v, 'default', 0, true, cfg),
    includeRunning: false,
    includeInsurance: false,
    includeFsd: false,
    fsdPrice: cfg.fsdPrice,
    aprOverride: null,
    ...over,
  };
}

// Golden set: tesla.com/en_us 2026-06-22 displayed monthlies (pre-sales-tax).
// Lease reproduces to the dollar; finance lands within ~$2 because Tesla shows a
// rounded APR (e.g. 5.69%) while computing on the exact underlying rate.
const FIN: Record<string, number> = {
  m3std: 521, m3prwd: 582, m3pawd: 653, m3perf: 761,
  mystd: 529, myawd: 574, myprwd: 631, mypawd: 688, myperf: 923,
};
const LEASE: Record<string, number> = {
  m3std: 329, m3prwd: 349, m3pawd: 449, m3perf: 599,
  mystd: 459, myawd: 499, myprwd: 599, mypawd: 699, myperf: 799,
};

describe('US market — finance reproduces tesla.com (pre-tax)', () => {
  for (const key of Object.keys(FIN)) {
    it(`${key} finance ≈ $${FIN[key]}/mo`, () => {
      const v = byKey(key);
      const r = computeScenario(v, settings(v), cfg);
      expect(Math.abs(r.methods.finance.pay - FIN[key])).toBeLessThan(3);
    });
  }
});

describe('US market — lease reproduces tesla.com to the dollar (pre-tax)', () => {
  for (const key of Object.keys(LEASE)) {
    it(`${key} lease ≈ $${LEASE[key]}/mo`, () => {
      const v = byKey(key);
      const r = computeScenario(v, settings(v), cfg);
      expect(Math.abs(r.methods.lease.pay - LEASE[key])).toBeLessThan(1.5);
    });
  }
});

describe('US market — structure', () => {
  it('residual is taken on price + destination, not base', () => {
    const v = byKey('m3std');
    const r = computeScenario(v, settings(v), cfg);
    expect(r.residual).toBe(Math.round((v.base + cfg.fees) * (v.residualPct / 100)));
  });

  it('uses each trim’s own APR and term (promos)', () => {
    const std = byKey('m3std');
    const prwd = byKey('m3prwd');
    expect(computeScenario(std, settings(std), cfg).financeApr).toBe(6.57);
    expect(computeScenario(prwd, settings(prwd), cfg).financeApr).toBe(0.99);
  });

  it('a manual APR override replaces the trim rate everywhere', () => {
    const v = byKey('m3std');
    const base = computeScenario(v, settings(v), cfg);
    const over = computeScenario(v, settings(v, { aprOverride: 10 }), cfg);
    expect(over.financeApr).toBe(10);
    expect(over.methods.finance.pay).toBeGreaterThan(base.methods.finance.pay);
  });

  it('sales tax is paid up front (not financed): monthly stays pre-tax', () => {
    const v = byKey('m3std');
    const taxed = computeScenario(v, settings(v, { taxRate: 0.0725 }), cfg);
    const untaxed = computeScenario(v, settings(v), cfg);
    // monthly unchanged by tax...
    expect(taxed.methods.finance.pay).toBeCloseTo(untaxed.methods.finance.pay, 6);
    // ...but the upfront grows by tax on the price + the order fee
    expect(taxed.methods.finance.upfront - untaxed.methods.finance.upfront).toBeCloseTo(
      0.0725 * (v.base + cfg.fees),
      4,
    );
    expect(untaxed.methods.finance.upfront - v.financeDown).toBeCloseTo(cfg.orderFee, 6);
  });
});

import { describe, it, expect } from 'vitest';
import { computeScenario, financeTermQuotes } from '@domain/scenario';
import type { ScenarioSettings } from '@domain/types';
import { CONFIG } from '@data/config';
import { vehicleByKey } from '@data/vehicles';
import { US_MARKET } from '@data/markets/us';

const m3rwd = vehicleByKey('m3rwd')!;
const TERMS = [36, 48, 60, 72, 84, 96];

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

describe('rate-by-term resolution in computeScenario', () => {
  it('default term (96) uses the confirmed 5.03% anchor', () => {
    const r = computeScenario(m3rwd, settings(), CONFIG);
    expect(r.financeTerm).toBe(96);
    expect(r.financeApr).toBe(5.03);
    expect(r.financeAprConfirmed).toBe(true);
  });

  it('choosing 60 mo drops to that rung’s rate, not the flat 5.03%', () => {
    const r = computeScenario(m3rwd, settings({ financeTermOverride: 60 }), CONFIG);
    expect(r.financeApr).toBe(4.03);
    expect(r.financeAprConfirmed).toBe(false); // estimated rung → flagged "est"
  });

  it('a manual APR override wins over the ladder and is treated as confirmed', () => {
    const r = computeScenario(m3rwd, settings({ aprOverride: 2.5, financeTermOverride: 72 }), CONFIG);
    expect(r.financeApr).toBe(2.5);
    expect(r.financeAprConfirmed).toBe(true);
  });
});

describe('financeTermQuotes — CA Model 3 RWD', () => {
  const quotes = financeTermQuotes(m3rwd, settings(), CONFIG, TERMS);

  it('returns one quote per term, in order', () => {
    expect(quotes.map((q) => q.months)).toEqual(TERMS);
  });

  it('APR follows the ladder (96 confirmed, shorter rungs estimated)', () => {
    const by = Object.fromEntries(quotes.map((q) => [q.months, q]));
    expect(by[96].apr).toBe(5.03);
    expect(by[96].confirmed).toBe(true);
    expect(by[60].apr).toBe(4.03);
    expect(by[60].confirmed).toBe(false);
  });

  it('a longer term lowers the monthly but raises total interest', () => {
    for (let i = 1; i < quotes.length; i++) {
      expect(quotes[i].monthly).toBeLessThan(quotes[i - 1].monthly);
      expect(quotes[i].interest).toBeGreaterThan(quotes[i - 1].interest);
    }
  });

  it('the 8-yr plan is both the priciest rate and the most interest', () => {
    const longest = quotes[quotes.length - 1];
    expect(Math.max(...quotes.map((q) => q.apr))).toBe(longest.apr);
    expect(Math.max(...quotes.map((q) => q.interest))).toBe(longest.interest);
  });

  it('interest = total paid − amount financed (tax rolled in for CA)', () => {
    const q96 = quotes[quotes.length - 1];
    const principal = (m3rwd.base + CONFIG.fees) * 1.13 - m3rwd.financeDown;
    expect(q96.interest).toBeCloseTo(q96.totalPaid - principal, 4);
  });

  it('the 96-mo quote matches the main table’s finance payment', () => {
    const scenario = computeScenario(m3rwd, settings(), CONFIG);
    const q96 = quotes.find((q) => q.months === 96)!;
    expect(q96.monthly).toBeCloseTo(scenario.methods.finance.pay, 6);
  });
});

describe('financeTermQuotes — US keeps the trim’s promo rate across terms', () => {
  const v = US_MARKET.vehicles.find((x) => x.finance && x.finance.apr > 0)!;
  const usSettings = settings({ financeDown: v.financeDown });
  const quotes = financeTermQuotes(v, usSettings, US_MARKET.config, TERMS);

  it('every term carries the trim APR (no CA-style ladder) and is confirmed', () => {
    for (const q of quotes) {
      expect(q.apr).toBe(v.finance!.apr);
      expect(q.confirmed).toBe(true);
    }
  });
});

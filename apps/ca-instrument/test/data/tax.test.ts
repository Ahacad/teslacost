import { describe, it, expect } from 'vitest';
import { PROVINCES, regionByCode, regionRate } from '@data/tax';

const FEES = 2642;
const ca = (code: string, base: number) => regionRate(regionByCode(PROVINCES, code), base + FEES);

describe('regionRate — flat provinces (price-independent)', () => {
  it('ON 13%, AB 5%, NS 15%, QC 14.975% regardless of price', () => {
    for (const price of [39490, 74990, 200000]) {
      expect(regionRate(regionByCode(PROVINCES, 'ON'), price)).toBeCloseTo(0.13, 6);
      expect(regionRate(regionByCode(PROVINCES, 'AB'), price)).toBeCloseTo(0.05, 6);
      expect(regionRate(regionByCode(PROVINCES, 'NS'), price)).toBeCloseTo(0.15, 6);
      expect(regionRate(regionByCode(PROVINCES, 'QC'), price)).toBeCloseTo(0.14975, 6);
    }
  });
});

describe('regionRate — BC luxury PST tiers (GST 5% + PST band)', () => {
  it('is a flat 12% under $55k', () => {
    expect(ca('BC', 39490)).toBeCloseTo(0.12, 6); // M3 RWD  → 42,132
    expect(ca('BC', 49990)).toBeCloseTo(0.12, 6); // M3 AWD  → 52,632, still under $55k
  });

  it('steps through the $55k–$57k surtax bands', () => {
    expect(regionRate(regionByCode(PROVINCES, 'BC'), 55_000)).toBeCloseTo(0.13, 6); // 8% PST
    expect(regionRate(regionByCode(PROVINCES, 'BC'), 56_000)).toBeCloseTo(0.14, 6); // 9% PST
    expect(regionRate(regionByCode(PROVINCES, 'BC'), 57_000)).toBeCloseTo(0.15, 6); // 10% PST
  });

  it('is 15% for the $57k–$125k band (the trims that were undercharged)', () => {
    expect(ca('BC', 74990)).toBeCloseTo(0.15, 6); // M3/MY Performance → 77,632
    expect(ca('BC', 64990)).toBeCloseTo(0.15, 6); // MY Premium        → 67,632
  });

  it('reaches the 15%/20% PST super-luxury bands', () => {
    expect(regionRate(regionByCode(PROVINCES, 'BC'), 130_000)).toBeCloseTo(0.20, 6); // 15% PST
    expect(regionRate(regionByCode(PROVINCES, 'BC'), 160_000)).toBeCloseTo(0.25, 6); // 20% PST
  });
});

describe('regionByCode', () => {
  it('falls back to the first region for an unknown code', () => {
    expect(regionByCode(PROVINCES, 'ZZ')).toBe(PROVINCES[0]);
  });
});

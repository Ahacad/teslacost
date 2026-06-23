import { describe, it, expect } from 'vitest';
import { computeScenario } from '@domain/scenario';
import { cumulativePoints } from '@domain/cumulative';
import type { ScenarioSettings } from '@domain/types';
import { CONFIG } from '@data/config';
import { vehicleByKey } from '@data/vehicles';

const m3rwd = vehicleByKey('m3rwd')!;
const base: ScenarioSettings = {
  taxRate: 0.13,
  financeDown: 4300,
  leaseDown: 5000,
  includeRunning: false,
  includeInsurance: false,
  includeFsd: false,
  fsdPrice: 99,
  aprOverride: null,
};
const scn = computeScenario(m3rwd, base, CONFIG);
const opts = { months: 96, includeExtra: false, leaseTermMonths: 48 };

describe('cumulativePoints — shape', () => {
  it('returns months 0..N inclusive', () => {
    const pts = cumulativePoints('finance', scn, opts);
    expect(pts).toHaveLength(97);
    expect(pts[0].month).toBe(0);
    expect(pts[96].month).toBe(96);
  });

  it('cash is flat without extras (only the upfront step)', () => {
    const pts = cumulativePoints('cash', scn, opts);
    expect(pts[0].total).toBeCloseTo(scn.methods.cash.upfront, 6);
    expect(pts[96].total).toBeCloseTo(scn.methods.cash.upfront, 6);
  });

  it('cash climbs by the monthly extra when included', () => {
    const pts = cumulativePoints('cash', scn, { ...opts, includeExtra: true });
    const ex = scn.extra;
    expect(pts[12].total - pts[0].total).toBeCloseTo(ex * 12, 6);
  });

  it('finance starts at the down payment and rises monotonically', () => {
    const pts = cumulativePoints('finance', scn, opts);
    expect(pts[0].total).toBeCloseTo(scn.financeDown, 6);
    for (let m = 1; m <= 96; m++) expect(pts[m].total).toBeGreaterThan(pts[m - 1].total);
    expect(pts[96].total).toBeCloseTo(scn.financeDown + scn.methods.finance.pay * 96, 6);
  });
});

describe('cumulativePoints — lease re-lease', () => {
  const pts = cumulativePoints('lease', scn, opts);

  it('jumps by a second down payment at the re-lease month', () => {
    const stepAtRelease = pts[48].total - pts[47].total;
    const normalStep = pts[20].total - pts[19].total;
    expect(stepAtRelease - normalStep).toBeCloseTo(scn.methods.lease.upfront, 6);
  });

  it('cumulative at month 96 equals the 8-year lease net', () => {
    expect(pts[96].total).toBeCloseTo(scn.methods.lease.net8, 6);
  });
});

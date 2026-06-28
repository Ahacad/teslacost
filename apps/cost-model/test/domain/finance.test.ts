import { beforeEach, describe, expect, it } from 'vitest';
import { S } from '../../src/state';
import { WORLDS } from '../../src/data/worlds';
import { pmt } from '../../src/domain/amort';
import {
  cashOut, value, equity, df, beatsKia, walkAway, monthlyAllIn, prin, termOf, insRaw, negEquity,
} from '../../src/domain/finance';

const w = (key: string) => WORLDS.find((x) => x.key === key)!;
const DEFAULTS = {
  hold: 60, gas: 4.60, miles: 23400, ev: 50, view: 'net' as const, conserv: false, tradeCredit: true,
  infl: 0, insMult: 1, loanTerm: 72, delay: 0, kiaOwed: 30000, kiaApr: 5.1, kiaMonths: 35,
};

beforeEach(() => {
  Object.assign(S, DEFAULTS);
});

// Ground truth = engine output at default state, cross-checked by hand for the Kia
// (cash 72,088 − resale equity 10,850 = net 61,238). The EV rows are unchanged from the
// original validated artifact (delay 0 ⇒ negEquity(0) = ROLL_BASE = $9k, so principals match);
// the Kia row reflects the refreshed high-mileage residual curve (private $24k→$9.2k),
// and the lease now carries the Kia negative equity in cash (the original model omitted it).
describe('default state reproduces the validated table (Cost @ 60mo)', () => {
  const EXPECT: Record<string, { val: number; mo: number; be: number | null; wa: number | null }> = {
    kia:     { val: 61239, mo: 1587, be: null, wa: 14 },
    ioniq:   { val: 55011, mo: 991,  be: 39,   wa: 52 },
    my099:   { val: 58679, mo: 1193, be: 44,   wa: 30 },
    usedmy6: { val: 53344, mo: 1046, be: 19,   wa: 40 },
    usedmy:  { val: 59358, mo: 1133, be: 52,   wa: 43 },
    phev:    { val: 70040, mo: 1385, be: null, wa: 36 },
    my627:   { val: 69442, mo: 1383, be: 95,   wa: 39 },
    lease:   { val: 56400, mo: 790,  be: 9,    wa: null },
  };
  for (const [key, e] of Object.entries(EXPECT)) {
    it(`${key}`, () => {
      expect(Math.round(value(w(key), 60))).toBe(e.val);
      expect(Math.round(monthlyAllIn(w(key)))).toBe(e.mo);
      expect(beatsKia(w(key))).toBe(e.be);
      expect(walkAway(w(key))).toBe(e.wa);
    });
  }
});

describe('amortization identities', () => {
  it('0% APR → pmt = P/n', () => {
    expect(pmt(72000, 0, 72)).toBe(1000);
  });
  it('at infl=0, cashOut equals the closed form down + pmt·min(m,n) + run·m', () => {
    const x = w('usedmy6');
    const m = 60;
    const p = pmt(prin(x), x.apr, termOf(x));
    const run = insRaw(x) + x.maint; // no gas/energy beyond insurance+maint for a pure-EV at ev=50
    const energy = 50;
    const closed = x.upfront + p * Math.min(m, termOf(x)) + (run + energy) * m;
    expect(cashOut(x, m)).toBeCloseTo(closed, 6);
  });
  it('df(t) = 1 when infl = 0', () => {
    expect(df(12)).toBe(1);
    expect(df(96)).toBe(1);
  });
});

describe('net = cashOut − equity·df (the displayed identity)', () => {
  it('holds across worlds and a discount rate', () => {
    S.infl = 3;
    S.insMult = 1.2;
    for (const x of WORLDS) {
      expect(value(x, S.hold)).toBeCloseTo(cashOut(x, S.hold) - equity(x, S.hold) * df(S.hold), 9);
    }
  });
});

describe('loan-term selector flexes financed switches only', () => {
  it('Kia keeps 35mo and lease keeps 36mo regardless of S.loanTerm', () => {
    S.loanTerm = 48;
    expect(termOf(w('kia'))).toBe(35);
    expect(termOf(w('lease'))).toBe(36);
    expect(termOf(w('usedmy6'))).toBe(48);
  });
  it('a shorter term raises the payment and lowers 60-mo net for used MY @ 6%', () => {
    const net72 = value(w('usedmy6'), 60);
    S.loanTerm = 48;
    const net48 = value(w('usedmy6'), 60);
    expect(net48).toBeLessThan(net72);
    expect(Math.round(net48)).toBe(50693); // validated 48-mo pin
  });
});

describe('inflation barely moves the 5-yr verdict (still favors switching)', () => {
  it('used MY @ 6% stays cheaper than the Kia at 0% and 5% discount', () => {
    expect(value(w('usedmy6'), 60)).toBeLessThan(value(w('kia'), 60));
    S.infl = 5;
    expect(value(w('usedmy6'), 60)).toBeLessThan(value(w('kia'), 60));
  });
});

describe('negative equity is derived from the Kia loan, not hardcoded', () => {
  it('negEquity(0) = balance − trade = $9,000 (= ROLL_BASE, so the base chart is unchanged)', () => {
    expect(Math.round(negEquity(0))).toBe(9000);
  });
  it('waiting shrinks the gap and crosses to positive equity by ~month 17 (35mo/5.1% loan)', () => {
    expect(negEquity(6)).toBeLessThan(negEquity(0));
    expect(negEquity(15)).toBeGreaterThan(0);
    expect(negEquity(18)).toBeLessThan(0); // above water by month 18
  });
  it('a longer remaining loan keeps you underwater (the load-bearing input)', () => {
    S.kiaMonths = 72;
    expect(negEquity(18)).toBeGreaterThan(0); // 72mo note: still underwater after 18 months
  });
});

describe('delay re-bases switch worlds: glued to the Kia until the switch month', () => {
  it('every switch world equals "keep the Kia" for months ≤ delay, then diverges', () => {
    S.delay = 12;
    for (const x of WORLDS) {
      if (x.key === 'kia') continue;
      for (const m of [3, 6, 9, 12]) expect(value(x, m)).toBeCloseTo(value(w('kia'), m), 6);
      expect(value(x, 24)).not.toBeCloseTo(value(w('kia'), 24), 1); // peeled off after the switch
    }
  });
  it('delay lowers the rolled principal but the EV is held fewer months', () => {
    const prin0 = prin(w('usedmy6'));
    S.delay = 12;
    const prin12 = prin(w('usedmy6'));
    expect(prin12).toBeLessThan(prin0); // less negative equity rolled in
    expect(Math.round(prin12)).toBe(38699);
    expect(Math.round(value(w('usedmy6'), 60))).toBe(59175); // waiting raises 60-mo cost (Kia gas burned)
  });
});

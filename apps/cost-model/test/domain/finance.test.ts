import { beforeEach, describe, expect, it } from 'vitest';
import { S } from '../../src/state';
import { WORLDS } from '../../src/data/worlds';
import { pmt } from '../../src/domain/amort';
import {
  cashOut, value, equity, df, beatsKia, walkAway, monthlyAllIn, prin, termOf, insRaw,
} from '../../src/domain/finance';

const w = (key: string) => WORLDS.find((x) => x.key === key)!;
const DEFAULTS = { hold: 60, gas: 4.60, miles: 23400, ev: 50, view: 'net' as const, conserv: false, tradeCredit: true, infl: 0, insMult: 1, loanTerm: 72 };

beforeEach(() => {
  Object.assign(S, DEFAULTS);
});

// Ground truth = the original self-contained HTML, read back via headless-Chrome --dump-dom
// at default state. These pins lock the TS port to the validated artifact to the dollar.
describe('default state reproduces the validated table (Cost @ 60mo)', () => {
  const EXPECT: Record<string, { val: number; mo: number; be: number | null; wa: number | null }> = {
    kia:     { val: 65089, mo: 1587, be: null, wa: 19 },
    ioniq:   { val: 55011, mo: 991,  be: 24,   wa: 52 },
    my099:   { val: 58679, mo: 1193, be: 18,   wa: 30 },
    usedmy6: { val: 53344, mo: 1046, be: 9,    wa: 40 },
    usedmy:  { val: 59358, mo: 1133, be: 13,   wa: 43 },
    phev:    { val: 70040, mo: 1385, be: null, wa: 36 },
    my627:   { val: 69442, mo: 1383, be: 88,   wa: 39 },
    lease:   { val: 47400, mo: 790,  be: 1,    wa: null },
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

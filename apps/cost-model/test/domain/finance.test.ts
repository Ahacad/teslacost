import { beforeEach, describe, expect, it } from 'vitest';
import { S } from '../../src/state';
import { WORLDS, MY_PRETAX, MY_DOWN5, MY_RACK, TAX_RATE } from '../../src/data/worlds';
import { pmt } from '../../src/domain/amort';
import {
  cashOut, value, equity, df, beatsKia, walkAway, monthlyAllIn, prin, termOf, insRaw, negEquity, tradeCredit,
  upfrontOf, energyMonthly, gasMonthly, subMonthly,
} from '../../src/domain/finance';

const w = (key: string) => WORLDS.find((x) => x.key === key)!;
const DEFAULTS = {
  hold: 60, gas: 4.60, miles: 23400, ev: 25, view: 'net' as const, conserv: false, tradeCredit: true,
  infl: 0, insMult: 1, loanTerm: 72, delay: 0, kiaOwed: 30100, kiaApr: 5.19, kiaMonths: 35, fsd: true,
  insKia: 283, insMy: 417, kiaOffer: 26000, buyApr: 0, myDown: 2000,
};

beforeEach(() => {
  Object.assign(S, DEFAULTS);
});

// Ground truth = an independent Python mirror of the engine (closed-form amortization +
// hand-built world table), NOT engine output. Scenario: the real July-2026 statement —
// Kia $30,100 @ 5.19% / 35 mo, Tesla trade offer $26,000 (X-Line), free apartment 7.9kW
// charging ($25 case). The two tiered MY rows model Tesla's down-payment bands: promo
// (0.99%, loan ≤ 100% LTV, 5% + taxes/fees + gap in cash) and roll (2.99%, >100% LTV).
describe('default state reproduces the validated table (Cost @ 60mo)', () => {
  const EXPECT: Record<string, { val: number; mo: number; be: number | null; wa: number | null; up: number }> = {
    kia:     { val: 61389, mo: 1591, be: null, wa: 14,   up: 0 },
    ioniq:   { val: 48058, mo: 891,  be: 1,    wa: 48,   up: 0 },
    my099:   { val: 73276, mo: 1337, be: null, wa: 1,    up: 10709 },
    my299:   { val: 77250, mo: 1508, be: null, wa: 29,   up: 2553 },
    usedmy6: { val: 45371, mo: 931,  be: 1,    wa: 30,   up: 0 },
    usedmy:  { val: 50647, mo: 1007, be: 1,    wa: 34,   up: 0 },
    phev:    { val: 63567, mo: 1295, be: 1,    wa: 28,   up: 0 },
    mystd:   { val: 82753, mo: 1614, be: null, wa: 35,   up: 553 },
    lease:   { val: 50000, mo: 765,  be: 1,    wa: null, up: 0 },
  };
  for (const [key, e] of Object.entries(EXPECT)) {
    it(`${key}`, () => {
      expect(Math.round(value(w(key), 60))).toBe(e.val);
      expect(Math.round(monthlyAllIn(w(key)))).toBe(e.mo);
      expect(beatsKia(w(key))).toBe(e.be);
      expect(walkAway(w(key))).toBe(e.wa);
      expect(Math.round(upfrontOf(w(key)))).toBe(e.up);
    });
  }
});

describe('the 0.99% promo tier is a cash gate, not a principal knob', () => {
  it('principal is fixed at 95% of the pre-tax price', () => {
    expect(prin(w('my099'))).toBe(MY_PRETAX - MY_DOWN5);
    expect(prin(w('my099'))).toBeCloseTo(52848.5, 6);
  });
  it('upfront = 5% down + WA tax net of trade credit + rack + Kia gap', () => {
    const tax = (MY_PRETAX - S.kiaOffer) * TAX_RATE;
    expect(upfrontOf(w('my099'))).toBeCloseTo(MY_DOWN5 + tax + MY_RACK + negEquity(0), 6);
    expect(upfrontOf(w('my099'))).toBeCloseTo(10708.615, 3);
  });
  it('payment lands on $756/mo (72 mo @ 0.99%)', () => {
    expect(pmt(prin(w('my099')), 0.99, 72)).toBeCloseTo(756.325, 2);
  });
  it('a better trade offer shrinks the cash gate dollar-for-dollar plus the tax credit', () => {
    const before = upfrontOf(w('my099'));
    S.kiaOffer = 21000;
    // offer −$5k → gap +$5k and tax credit −$5k×11.05%: gate rises 5000×1.1105
    expect(upfrontOf(w('my099')) - before).toBeCloseTo(5000 * (1 + TAX_RATE), 4);
  });
  it('waiting 12 months nearly closes the gap: gate drops to ~$6.5k', () => {
    S.delay = 12;
    expect(upfrontOf(w('my099'))).toBeCloseTo(6464.894, 2);
    expect(negEquity(12)).toBeCloseTo(-697.799, 2);
  });
  it('rolled-in myDown does not touch the promo tier', () => {
    const p = prin(w('my099'));
    const u = upfrontOf(w('my099'));
    S.myDown = 6000;
    expect(prin(w('my099'))).toBe(p);
    expect(upfrontOf(w('my099'))).toBe(u);
  });
});

describe('the 2.99% roll tier finances everything above the chosen down', () => {
  it('principal = OTD − trade credit + gap − down', () => {
    expect(prin(w('my299'))).toBeCloseTo(61004, 4);
    expect(upfrontOf(w('my299'))).toBe(S.myDown + MY_RACK);
  });
  it('payment lands on $927/mo (72 mo @ 2.99%)', () => {
    expect(pmt(prin(w('my299')), 2.99, 72)).toBeCloseTo(926.602, 2);
  });
  it('more cash down moves principal 1:1', () => {
    S.myDown = 6000;
    expect(prin(w('my299'))).toBeCloseTo(57004, 4);
    expect(upfrontOf(w('my299'))).toBe(6553);
  });
  it('the tier spread: rolling costs ~$4.1k more interest than the promo over 72 mo', () => {
    const int099 = pmt(prin(w('my099')), 0.99, 72) * 72 - prin(w('my099'));
    const int299 = pmt(prin(w('my299')), 2.99, 72) * 72 - prin(w('my299'));
    expect(Math.round(int099)).toBe(1607);
    expect(Math.round(int299)).toBe(5711);
  });
  it('starts deep underwater (rolled tax + gap) but walks away whole by month 29', () => {
    expect(equity(w('my299'), 1)).toBeCloseTo(-5385.23, 1);
    expect(walkAway(w('my299'))).toBe(29);
  });
  it('the buy-APR dial does not touch either tiered row', () => {
    const a = monthlyAllIn(w('my099'));
    const b = monthlyAllIn(w('my299'));
    S.buyApr = 8;
    expect(monthlyAllIn(w('my099'))).toBe(a);
    expect(monthlyAllIn(w('my299'))).toBe(b);
  });
});

describe('WA trade-in tax credit is derived from the live trade value', () => {
  it('11.05% of the $26k offer = $2,873', () => {
    expect(tradeCredit(0)).toBeCloseTo(2873, 4);
  });
  it('scales with the offer (old $21k default → $2,320.50)', () => {
    S.kiaOffer = 21000;
    expect(tradeCredit(0)).toBeCloseTo(2320.5, 4);
  });
  it('toggling it off raises the roll-tier principal by the credit and the promo gate by the tax', () => {
    const p = prin(w('my299'));
    const u = upfrontOf(w('my099'));
    S.tradeCredit = false;
    expect(prin(w('my299')) - p).toBeCloseTo(2873, 4);
    expect(upfrontOf(w('my099')) - u).toBeCloseTo(2873, 4);
  });
});

describe('negative equity is derived from the real Kia statement', () => {
  it('negEquity(0) = 30,100 owed − 26,000 offer = $4,100', () => {
    expect(negEquity(0)).toBeCloseTo(4100, 6);
  });
  it('shrinks ~$580/mo and crosses to positive equity at month 11', () => {
    expect(negEquity(6)).toBeCloseTo(1764.62, 1);
    expect(negEquity(10)).toBeGreaterThan(0);
    expect(negEquity(11)).toBeLessThan(0);
  });
  it('a longer remaining loan keeps you underwater (the load-bearing input)', () => {
    S.kiaMonths = 72;
    expect(negEquity(18)).toBeGreaterThan(0);
  });
  it('a lower offer deepens the gap and rolls that much more into the untiered switch principals', () => {
    const before = prin(w('usedmy6'));
    S.kiaOffer = 18000;
    expect(negEquity(0)).toBeCloseTo(12100, 4);
    // gap +$8k, credit −$8k×11.05% → principal rises 8000×1.1105
    expect(prin(w('usedmy6')) - before).toBeCloseTo(8000 * (1 + TAX_RATE), 4);
  });
});

describe('monthly decomposition sums to monthlyAllIn (compare card invariant)', () => {
  it.each(['my099', 'my299'])('%s: payment + insurance + maint + charging + FSD', (key) => {
    const x = w(key);
    const parts = pmt(prin(x), x.apr, termOf(x)) + insRaw(x) + x.maint + energyMonthly(x) + subMonthly(x);
    expect(parts).toBeCloseTo(monthlyAllIn(x), 9);
  });
  it('Kia Sportage: payment + insurance + maint + gas (no FSD)', () => {
    const kia = w('kia');
    const parts = pmt(S.kiaOwed, S.kiaApr, S.kiaMonths) + insRaw(kia) + kia.maint + gasMonthly(kia) + subMonthly(kia);
    expect(parts).toBeCloseTo(monthlyAllIn(kia), 9);
  });
});

describe('new-buy APR override dial', () => {
  it('leaves the promos (Tesla tiers / Ioniq 0%) untouched but converges the used rows', () => {
    S.buyApr = 8;
    expect(Math.round(monthlyAllIn(w('ioniq')))).toBe(891);
    const a = monthlyAllIn(w('usedmy6'));
    expect(a).toBeCloseTo(monthlyAllIn(w('usedmy')), 6);
    const x = w('usedmy6');
    expect(a).toBeCloseTo(pmt(prin(x), 8, termOf(x)) + insRaw(x) + x.maint + energyMonthly(x), 6);
  });
});

describe('amortization identities', () => {
  it('0% APR → pmt = P/n', () => {
    expect(pmt(72000, 0, 72)).toBe(1000);
  });
  it('at infl=0, cashOut equals the closed form up + pmt·min(m,n) + run·m', () => {
    const x = w('usedmy6');
    const m = 60;
    const p = pmt(prin(x), x.apr, termOf(x));
    const closed = upfrontOf(x) + p * Math.min(m, termOf(x)) + (insRaw(x) + x.maint + energyMonthly(x)) * m;
    expect(cashOut(x, m)).toBeCloseTo(closed, 6);
  });
  it('the same closed form holds for the tiered rows (their upfront is the gate)', () => {
    for (const key of ['my099', 'my299']) {
      const x = w(key);
      const m = 60;
      const p = pmt(prin(x), x.apr, termOf(x));
      const closed = upfrontOf(x) + p * m + (insRaw(x) + x.maint + energyMonthly(x) + subMonthly(x)) * m;
      expect(cashOut(x, m)).toBeCloseTo(closed, 6);
    }
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
    expect(Math.round(net48)).toBe(43046);
  });
});

describe('delay re-bases switch worlds: glued to the Kia until the switch month', () => {
  it('every switch world equals "keep the Kia" for months ≤ delay, then diverges', () => {
    S.delay = 12;
    for (const x of WORLDS) {
      if (x.key === 'kia') continue;
      for (const m of [3, 6, 9, 12]) expect(value(x, m)).toBeCloseTo(value(w('kia'), m), 6);
      expect(value(x, 24)).not.toBeCloseTo(value(w('kia'), 24), 1);
    }
  });
  it('delay lowers the rolled principal / cash gate but waiting still raises 60-mo cost', () => {
    const prin0 = prin(w('usedmy6'));
    S.delay = 12;
    expect(prin(w('usedmy6'))).toBeLessThan(prin0);
    expect(Math.round(prin(w('usedmy6')))).toBe(34740);
    expect(Math.round(value(w('usedmy6'), 60))).toBe(53397);
    expect(Math.round(value(w('my099'), 60))).toBe(76913);
    expect(Math.round(value(w('my299'), 60))).toBe(80175);
  });
});

describe('EV charging scales with miles driven (free apartment L2 case)', () => {
  it('at the calibration mileage the $25 road-trip-only case applies unscaled', () => {
    expect(energyMonthly(w('my099'))).toBe(25);
  });
  it('halving miles halves EV energy, and the Tesla line moves by exactly that', () => {
    const base = monthlyAllIn(w('my099'));
    S.miles = 11700;
    expect(energyMonthly(w('my099'))).toBeCloseTo(12.5, 9);
    expect(base - monthlyAllIn(w('my099'))).toBeCloseTo(12.5, 9);
  });
  it('the winter case scales too, on the lease as well', () => {
    S.ev = 120; S.miles = 30000;
    expect(energyMonthly(w('lease'))).toBeCloseTo(120 * 30000 / 23400, 9);
  });
});

describe('FSD subscription is a toggleable run cost on the new-MY worlds only', () => {
  it('turning FSD off drops both tiered rows by exactly $109', () => {
    const on099 = monthlyAllIn(w('my099'));
    const on299 = monthlyAllIn(w('my299'));
    S.fsd = false;
    expect(Math.round(on099 - monthlyAllIn(w('my099')))).toBe(109);
    expect(Math.round(on299 - monthlyAllIn(w('my299')))).toBe(109);
  });
  it('even without FSD the new build does not beat the Kia inside 96 months', () => {
    S.fsd = false;
    expect(beatsKia(w('my099'))).toBe(null);
  });
});

describe('insurance: real quotes for the Kia and all three new-MY rows', () => {
  it('the Model Y quote input moves all three new-MY rows equally, and only them', () => {
    const before = { my: monthlyAllIn(w('my099')), r: monthlyAllIn(w('my299')), std: monthlyAllIn(w('mystd')), used: monthlyAllIn(w('usedmy6')) };
    S.insMy = 500;
    expect(monthlyAllIn(w('my099')) - before.my).toBeCloseTo(83, 9);
    expect(monthlyAllIn(w('my299')) - before.r).toBeCloseTo(83, 9);
    expect(monthlyAllIn(w('mystd')) - before.std).toBeCloseTo(83, 9);
    expect(monthlyAllIn(w('usedmy6'))).toBe(before.used);
  });
  it('at the GEICO quote the build costs ~$16.9k more than the Kia at 5 years', () => {
    S.insMy = 500;
    expect(Math.round(value(w('my099'), 60) - value(w('kia'), 60))).toBe(16866);
  });
  it('with the $26k offer the used-MY edge survives even the ×1.8 stress', () => {
    S.insMult = 1.8;
    expect(Math.round(value(w('usedmy6'), 60) - value(w('kia'), 60))).toBe(-4978);
    expect(beatsKia(w('usedmy6'))).toBe(1);
  });
});

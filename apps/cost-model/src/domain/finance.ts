import type { World } from '../types';
import { S } from '../state';
import { MONTHS, WORLDS, KIA_TRADE, ROLL_BASE, TRADE_CREDIT, LEASE_PMT, GAS_MPG, PHEV_MPG } from '../data/worlds';
import { pmt, balance, interp } from './amort';

const KIA = WORLDS[0]; // the keep-the-Kia world; its loan is overridden by the editable S.kia* fields
const isKia = (w: World): boolean => w.key === 'kia';

// ---- the Kia you own now (loan + both resale curves) ----
const kiaPay = (): number => pmt(S.kiaOwed, S.kiaApr, S.kiaMonths);
const kiaBal = (m: number): number => balance(S.kiaOwed, S.kiaApr, S.kiaMonths, m);
const kiaRun = (): number => insRaw(KIA) + KIA.maint + gasMonthly(KIA);

/** Conservative-resale haircut applied to a Kia anchor curve (mirrors resaleAnchors' 0.95 case). */
function kiaCurve(anchors: number[]): number[] {
  if (!S.conserv) return anchors;
  return anchors.map((v, idx) => {
    const mo = MONTHS[idx];
    const f = mo <= 12 ? 1 : mo >= 36 ? 0.95 : 1 - (0.05 * (mo - 12)) / 24;
    return v * f;
  });
}
const kiaTrade = (m: number): number => interp(kiaCurve(KIA_TRADE), m);
const kiaPrivate = (m: number): number => interp(resaleAnchors(KIA), m);

/** Kia negative equity if you trade at month D = loan balance − dealer-trade value (can go negative = positive equity). */
export function negEquity(D: number): number {
  return kiaBal(D) - kiaTrade(D);
}

/** Months you keep the Kia before this world's switch (0 for the Kia itself; the global delay otherwise). */
export function delayOf(w: World): number {
  return isKia(w) ? 0 : S.delay;
}

/** Amount financed on the EV when you switch at the delay month: own price + rolled negative equity − WA trade credit. */
export function prin(w: World): number {
  if (!w.tradeIn) return w.principal; // Kia (own loan, handled via S) and the lease (0)
  const rolled = negEquity(delayOf(w));
  const credit = S.tradeCredit ? TRADE_CREDIT : 0;
  return Math.max(0, w.principal - ROLL_BASE + rolled - credit);
}

/** Present-value factor for a dollar spent at month t (1 when the rate is 0). */
export function df(t: number): number {
  const r = S.infl / 100;
  return r ? 1 / Math.pow(1 + r, t / 12) : 1;
}

/** Per-car insurance, scaled to your own quote level (keeps the per-car spread). */
export function insRaw(w: World): number {
  return w.insurance * S.insMult;
}

/** Loan length: the Kia keeps its remaining months and the lease its 36; new buys flex with the slider. */
export function termOf(w: World): number {
  if (isKia(w)) return S.kiaMonths;
  return w.type === 'lease' ? w.term : S.loanTerm;
}

export function resaleAnchors(w: World): number[] {
  if (!S.conserv || !w.owns) return w.resale;
  const cut =
    w.key === 'my099' || w.key === 'mystd' ? 0.90
    : w.key === 'usedmy' || w.key === 'usedmy6' ? 0.92
    : 0.95;
  return w.resale.map((v, idx) => {
    const mo = MONTHS[idx];
    const f = mo <= 12 ? 1 : mo >= 36 ? cut : 1 - ((1 - cut) * (mo - 12)) / 24;
    return v * f;
  });
}

export function gasMonthly(w: World): number {
  if (w.type === 'gas') return ((S.miles / GAS_MPG) * S.gas) / 12;
  if (w.type === 'phev') {
    const wknd = S.miles * 0.64;
    return 20 + ((wknd / PHEV_MPG) * S.gas) / 12;
  }
  return 0;
}

export function energyMonthly(w: World): number {
  return w.type === 'ev' || w.type === 'lease' ? S.ev : 0;
}

/** FSD (or similar) software subscription, paid only while the toggle is on. */
export function subMonthly(w: World): number {
  return S.fsd && w.sub ? w.sub : 0;
}

/** Steady-state monthly all-in AFTER the switch (the comparable figure); the Kia phase is just the Kia. */
export function monthlyAllIn(w: World): number {
  if (isKia(w)) return kiaPay() + kiaRun();
  const p = w.type === 'lease' ? LEASE_PMT : pmt(prin(w), w.apr, termOf(w));
  return p + insRaw(w) + w.maint + gasMonthly(w) + energyMonthly(w) + subMonthly(w);
}

/**
 * Total cash out by month m, each future month discounted to today's dollars.
 * A switch world is a composite: drive the Kia for D = delayOf(w) months, then the EV.
 */
export function cashOut(w: World, m: number): number {
  // Kia-only world (and the reference path every switch world shares up to month D).
  if (isKia(w)) {
    let pv = 0;
    for (let t = 1; t <= m; t++) pv += ((t <= S.kiaMonths ? kiaPay() : 0) + kiaRun()) * df(t);
    return pv;
  }
  const D = delayOf(w);
  let pv = 0;
  // Phase 1 — keep the Kia for the first D months (its loan + running cost).
  for (let t = 1; t <= Math.min(m, D); t++) pv += ((t <= S.kiaMonths ? kiaPay() : 0) + kiaRun()) * df(t);
  if (m <= D) return pv;
  // Switch at month D: down payment now (lease covers its rolled negative equity in cash instead).
  const evPay = w.type === 'lease' ? LEASE_PMT : pmt(prin(w), w.apr, termOf(w));
  const evRun = insRaw(w) + w.maint + gasMonthly(w) + energyMonthly(w) + subMonthly(w);
  const n = termOf(w);
  pv += (w.type === 'lease' ? Math.max(0, negEquity(D)) : w.upfront) * df(D || 0);
  // Phase 2 — the EV from month D+1 onward; its loan runs n months from the switch.
  for (let t = D + 1; t <= m; t++) {
    const age = t - D;
    const pay = w.type === 'lease' ? LEASE_PMT : age <= n ? evPay : 0;
    pv += (pay + evRun) * df(t);
  }
  return pv;
}

export function equity(w: World, m: number): number {
  if (isKia(w)) return kiaPrivate(m) - kiaBal(m);
  const D = delayOf(w);
  if (m <= D) return kiaPrivate(m) - kiaBal(m); // still own the Kia during the wait (even if the destination is a lease)
  if (!w.owns) return 0; // a lease owns nothing once you're in it
  const age = m - D;
  return interp(resaleAnchors(w), age) - balance(prin(w), w.apr, termOf(w), age);
}

/** Net = cash out − resale equity (a future receipt, so discounted too); cash view skips equity. */
export function value(w: World, m: number): number {
  return S.view === 'cash' ? cashOut(w, m) : cashOut(w, m) - equity(w, m) * df(m);
}

/** First month this world's cost dips below keeping the Kia. */
export function beatsKia(w: World): number | null {
  if (w.key === 'kia') return null;
  const k = WORLDS[0];
  for (let m = 1; m <= 96; m++) if (value(w, m) < value(k, m)) return m;
  return null;
}

/** First month the car is worth at least what you still owe. */
export function walkAway(w: World): number | null {
  if (!w.owns) return null;
  for (let m = 1; m <= 96; m++) if (equity(w, m) >= 0) return m;
  return null;
}

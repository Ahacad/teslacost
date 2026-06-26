import type { World } from '../types';
import { S } from '../state';
import { MONTHS, WORLDS, TRADE_CREDIT, LEASE_PMT, GAS_MPG, PHEV_MPG } from '../data/worlds';
import { pmt, balance, interp } from './amort';

/** Amount financed after the optional WA trade-in tax credit. */
export function prin(w: World): number {
  return Math.max(0, w.principal - (w.tradeIn && S.tradeCredit ? TRADE_CREDIT : 0));
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

/** Loan length: the Kia keeps its 35 left and the lease its 36; new buys flex with the slider. */
export function termOf(w: World): number {
  return w.key === 'kia' || w.type === 'lease' ? w.term : S.loanTerm;
}

export function resaleAnchors(w: World): number[] {
  if (!S.conserv || !w.owns) return w.resale;
  const cut =
    w.key === 'my099' || w.key === 'my627' ? 0.90
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

export function monthlyAllIn(w: World): number {
  const p = w.type === 'lease' ? LEASE_PMT : pmt(prin(w), w.apr, termOf(w));
  return p + insRaw(w) + w.maint + gasMonthly(w) + energyMonthly(w);
}

/** Total cash out by month m, each future month discounted to today's dollars. */
export function cashOut(w: World, m: number): number {
  const op = insRaw(w) + w.maint + gasMonthly(w) + energyMonthly(w);
  const p = w.type === 'lease' ? LEASE_PMT : pmt(prin(w), w.apr, termOf(w));
  const term = w.type === 'lease' ? m : termOf(w); // a lease keeps paying every month held
  let pv = w.type === 'lease' ? 0 : w.upfront; // the down payment is spent today → never discounted
  for (let t = 1; t <= m; t++) pv += ((t <= term ? p : 0) + op) * df(t);
  return pv;
}

export function equity(w: World, m: number): number {
  if (!w.owns) return 0;
  return interp(resaleAnchors(w), m) - balance(prin(w), w.apr, termOf(w), m);
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

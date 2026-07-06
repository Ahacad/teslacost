import type { State, World } from './types';

export const S: State = {
  hold: 24, gas: 4.60, miles: 23400, ev: 50,
  view: 'net', conserv: false, tradeCredit: true,
  infl: 0, insMult: 1, loanTerm: 72,
  delay: 0, kiaOwed: 30000, kiaApr: 5.1, kiaMonths: 35, fsd: true,
  insKia: 283, insMy: 417,
};

export const hidden = new Set<string>();

/** The two lines spotlighted on the chart by default (keep-the-Kia vs the recommended new buy). */
export const FEAT = new Set(['kia', 'my099']);

/** Transient view state shared across the chart/table renderers. */
export const ui = {
  hi: null as string | null,
  exSel: 'my099',
  CHARTMAX: 0,
  VIS: [] as World[],
};

import type { State, World } from './types';

export const S: State = {
  hold: 24, gas: 4.60, miles: 23400, ev: 25,
  view: 'net', conserv: false, tradeCredit: true,
  infl: 0, insMult: 1, loanTerm: 72,
  delay: 0, kiaOwed: 30100, kiaApr: 5.19, kiaMonths: 35, fsd: true,
  insKia: 283, insMy: 417,
  kiaOffer: 26000, buyApr: 0, myDown: 2000,
};

export const hidden = new Set<string>();

/** Transient view state shared across the chart/table renderers. */
export const ui = {
  hi: null as string | null,
  exSel: 'my099',
  barTier: 'my099', // the selected MY financing row (my099 | my299 | mystd) — drives chart spotlight, bars, table highlight, worked example
  CHARTMAX: 0,
  VIS: [] as World[],
};

/** Chart spotlight: keep-the-Kia + whichever MY financing tier is selected. */
export const isFeat = (key: string): boolean => key === 'kia' || key === ui.barTier;

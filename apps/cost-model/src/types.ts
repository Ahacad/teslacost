export type WorldType = 'gas' | 'ev' | 'phev' | 'lease';
export type View = 'net' | 'cash';

/** One "possible world" — keep the Kia, or a specific switch (buy/lease, rate, term). */
export interface World {
  key: string;
  label: string;
  short: string;
  type: WorldType;
  color: string;
  tag?: string;
  tagBad?: string;
  upfront: number;
  principal: number;
  apr: number;
  term: number;
  insurance: number;
  maint: number;
  /** Resale value at anchor months [0,12,24,36,48,60,72,96]; linearly interpolated. */
  resale: number[];
  owns: boolean;
  note: string;
  /** Dealer-trade switch → eligible for the WA trade-in tax credit. */
  tradeIn?: boolean;
}

export interface State {
  hold: number;
  gas: number;
  miles: number;
  ev: number;
  view: View;
  conserv: boolean;
  tradeCredit: boolean;
  infl: number;
  insMult: number;
  loanTerm: number;
  /** Months you keep the Kia before trading it in (0 = switch now). */
  delay: number;
  /** Current Kia loan, editable to your real statement. */
  kiaOwed: number;
  kiaApr: number;
  kiaMonths: number;
}

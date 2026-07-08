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
  /**
   * Tesla down-payment tier. 'promo' = 0.99% band: 5% + taxes/fees + gap paid in
   * cash (≤100% LTV), principal fixed at 95% of pre-tax price. 'roll' = 2.99% band:
   * S.myDown cash, everything else financed (>100% LTV). Absent = not tiered.
   */
  tier?: 'promo' | 'roll';
  /** Monthly software subscription (FSD, WA tax included), paid only while S.fsd is on. */
  sub?: number;
  /** Display-only: the OTD price and down payment already netted into `principal`. */
  otd?: number;
  down?: number;
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
  /** Pay the FSD subscription on worlds that carry one. */
  fsd: boolean;
  /** Real insurance quotes, $/mo: your current Kia premium and the new-MY quote (6-mo quote / 6). */
  insKia: number;
  insMy: number;
  /** Your real Kia trade-in / instant-cash offer today ($); scales the whole dealer-trade curve. Default 21000 = modeled value. */
  kiaOffer: number;
  /** APR (%) override for the shop-around financed buys (used-MY / PHEV / standard-rate MY); 0 = each row keeps its own rate. */
  buyApr: number;
  /** Cash down on the roll-everything 2.99% tier ($); the promo tier's down is derived, not chosen. */
  myDown: number;
}

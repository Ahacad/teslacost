import { MONTHS } from '../data/worlds';

/** Standard loan payment; 0% APR → straight P/n. */
export function pmt(P: number, apr: number, n: number): number {
  const i = apr / 1200;
  return i ? (P * i) / (1 - Math.pow(1 + i, -n)) : P / n;
}

/** Balance still owed at month m (0 once m ≥ n). */
export function balance(P: number, apr: number, n: number, m: number): number {
  if (m >= n) return 0;
  const i = apr / 1200;
  const p = pmt(P, apr, n);
  return i
    ? P * Math.pow(1 + i, m) - (p * (Math.pow(1 + i, m) - 1)) / i
    : Math.max(0, P - p * m);
}

/** Straight-line interpolation across the MONTHS anchor grid. */
export function interp(anchors: number[], m: number): number {
  if (m <= 0) return anchors[0];
  if (m >= 96) return anchors[7];
  for (let k = 1; k < MONTHS.length; k++) {
    if (m <= MONTHS[k]) {
      const t = (m - MONTHS[k - 1]) / (MONTHS[k] - MONTHS[k - 1]);
      return anchors[k - 1] + t * (anchors[k] - anchors[k - 1]);
    }
  }
  return anchors[anchors.length - 1];
}

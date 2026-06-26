/** Round an axis maximum up to a clean 1/2/2.5/5/10 × 10ⁿ boundary. */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Compact a vehicle name for axis labels: "Model 3 Premium RWD" → "M3 Prm RWD". */
export const shortName = (n: string): string =>
  n.replace('Model ', 'M').replace(' Premium', ' Prm');

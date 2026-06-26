export function getCSS(v: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

export function fmtk(v: number): string {
  return '$' + Math.round(v / 1000) + 'k';
}

export const fmt = (v: number): string =>
  (v < 0 ? '-' : '') + '$' + Math.round(Math.abs(v)).toLocaleString();

export function num(v: number, d?: number): string {
  const f = d ? 10 ** d : 1;
  return (Math.round(v * f) / f).toLocaleString(undefined, {
    minimumFractionDigits: d || 0,
    maximumFractionDigits: d || 0,
  });
}

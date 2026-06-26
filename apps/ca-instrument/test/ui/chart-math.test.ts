import { describe, it, expect } from 'vitest';
import { niceMax, shortName } from '@ui/charts/chart-math';

describe('niceMax', () => {
  it('rounds up to clean 1/2/2.5/5/10 boundaries', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(0.9)).toBe(1);
    expect(niceMax(1.1)).toBe(2);
    expect(niceMax(2.1)).toBe(2.5);
    expect(niceMax(3)).toBe(5);
    expect(niceMax(6)).toBe(10);
  });
  it('scales by powers of ten', () => {
    expect(niceMax(833)).toBe(1000);
    expect(niceMax(36552)).toBe(50000);
    expect(niceMax(88000)).toBe(100000);
  });
});

describe('shortName', () => {
  it('compacts model names', () => {
    expect(shortName('Model 3 Premium RWD')).toBe('M3 Prm RWD');
    expect(shortName('Model Y Performance')).toBe('MY Performance');
  });
});

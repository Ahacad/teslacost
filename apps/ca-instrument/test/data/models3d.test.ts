import { describe, it, expect } from 'vitest';
import { assetFor, hexToRgb01, MODEL_ASSETS } from '@data/models3d';
import type { Vehicle } from '@domain/types';

const base: Vehicle = {
  key: 'x', name: 'X', model: 'Model 3', base: 40000,
  financeDown: 4300, residualPct: 41.5, residualConfirmed: true,
};

describe('assetFor', () => {
  it('returns the model-family default when there is no override', () => {
    expect(assetFor(base)).toBe(MODEL_ASSETS['Model 3']);
  });

  it('honors a per-trim glb override', () => {
    expect(assetFor({ ...base, glb: '/custom/foo.glb' }).glb).toBe('/custom/foo.glb');
  });

  it('falls back to a real asset for an unknown family', () => {
    expect(assetFor({ ...base, model: 'Cybertruck' }).glb).toBeTruthy();
  });
});

describe('hexToRgb01', () => {
  it('converts white', () => expect(hexToRgb01('#ffffff')).toEqual([1, 1, 1, 1]));
  it('converts black', () => expect(hexToRgb01('#000000')).toEqual([0, 0, 0, 1]));
  it('converts pure red', () => {
    const [r, g, b] = hexToRgb01('#ff0000');
    expect([r, g, b]).toEqual([1, 0, 0]);
  });
  it('expands shorthand hex', () => expect(hexToRgb01('#fff')).toEqual([1, 1, 1, 1]));
});

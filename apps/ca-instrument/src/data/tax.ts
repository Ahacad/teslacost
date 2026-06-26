import type { TaxRegion } from '@domain/types';

/** A Canadian province's sales-tax option (a {@link TaxRegion}). */
export type Province = TaxRegion;

/**
 * BC PST on a passenger vehicle bought from a GST registrant is tiered by price
 * (a luxury surtax above $55k), then 5% GST stacks on top. Bands (BC, 2024):
 *   <55k 7% · 55–56k 8% · 56–57k 9% · 57–125k 10% · 125–150k 15% · ≥150k 20%.
 */
function bcCombinedRate(priceWithFees: number): number {
  const pst =
    priceWithFees < 55_000 ? 0.07 :
    priceWithFees < 56_000 ? 0.08 :
    priceWithFees < 57_000 ? 0.09 :
    priceWithFees < 125_000 ? 0.10 :
    priceWithFees < 150_000 ? 0.15 :
    0.20;
  return 0.05 + pst;
}

export const PROVINCES: Province[] = [
  { code: 'ON', label: 'Ontario · 13% HST', rate: 0.13 },
  { code: 'AB', label: 'Alberta · 5% GST', rate: 0.05 },
  { code: 'BC', label: 'BC · 12% (+luxury PST >$55k)', rate: 0.12, rateFor: bcCombinedRate },
  { code: 'QC', label: 'Quebec · ~15%', rate: 0.14975 },
  { code: 'NS', label: 'Maritimes · 15% HST', rate: 0.15 },
];

export const DEFAULT_PROVINCE = PROVINCES[0];

/** Look up a tax region by code within a market's region list. */
export const regionByCode = (regions: TaxRegion[], code: string): TaxRegion =>
  regions.find((r) => r.code === code) ?? regions[0];

/** Effective combined sales-tax rate for a region at a given pre-tax price. */
export function regionRate(region: TaxRegion, priceWithFees: number): number {
  return region.rateFor ? region.rateFor(priceWithFees) : region.rate;
}

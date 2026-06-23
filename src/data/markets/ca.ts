import type { Market } from '@domain/types';
import { CONFIG } from '../config';
import { VEHICLES } from '../vehicles';
import { PROVINCES, DEFAULT_PROVINCE } from '../tax';

/** Canada — the original market. Data lives in ../{config,vehicles,tax,costs}. */
export const CA_MARKET: Market = {
  id: 'CA',
  label: 'Canada',
  flag: '🇨🇦',
  baseCurrencyCode: 'CAD',
  vehicles: VEHICLES,
  config: CONFIG,
  taxRegions: PROVINCES,
  defaultTaxRate: DEFAULT_PROVINCE.rate,
};

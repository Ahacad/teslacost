import type { Market } from '@domain/types';
import { CA_MARKET } from './ca';
import { US_MARKET } from './us';

/**
 * Every market the dashboard can show. Adding a market = one new file (its
 * vehicles/config/taxes/currency) + one entry here. Nothing in domain/, state/,
 * or ui/ needs to change.
 */
export const MARKETS: Market[] = [CA_MARKET, US_MARKET];

export const DEFAULT_MARKET = CA_MARKET;

export const marketById = (id: string): Market =>
  MARKETS.find((m) => m.id === id) ?? DEFAULT_MARKET;

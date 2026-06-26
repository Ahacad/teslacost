import type { RunningCosts } from '@domain/types';

/**
 * Recurring monthly extras by model family (CAD, Ontario-ish estimates).
 * Insurance and charging vary widely — these are mid-range point estimates;
 * the UI lets the user toggle/override them. See tesla_other_costs.md for the
 * verified ranges and sources.
 *
 * Add a model family = add a key here.
 */
export const RUNNING_COSTS: Record<string, RunningCosts> = {
  'Model 3': { connectivity: 14, charging: 30, maintenance: 40, insurance: 200 },
  'Model Y': { connectivity: 14, charging: 33, maintenance: 40, insurance: 210 },
};

/** Fallback when a vehicle's model family has no explicit running-cost row. */
export const DEFAULT_RUNNING: RunningCosts = {
  connectivity: 14,
  charging: 33,
  maintenance: 40,
  insurance: 210,
};

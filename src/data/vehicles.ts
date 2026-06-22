import type { Vehicle } from '@domain/types';

/**
 * Tesla Canada lineup, captured tesla.com/en_ca 2026-06-21 (CAD).
 *
 * Adding a model = appending one entry here. `residualConfirmed: false` marks a
 * residual we estimated rather than read off Tesla's lease tab (flagged "lease
 * est" in the UI). Model Y leases were never captured, so their residuals are
 * estimates.
 */
export const VEHICLES: Vehicle[] = [
  { key: 'm3rwd', name: 'Model 3 Premium RWD', model: 'Model 3', base: 39490, financeDown: 4300, residualPct: 41.5, residualConfirmed: true },
  { key: 'm3awd', name: 'Model 3 Premium AWD', model: 'Model 3', base: 49990, financeDown: 4300, residualPct: 44.9, residualConfirmed: true },
  { key: 'm3perf', name: 'Model 3 Performance', model: 'Model 3', base: 74990, financeDown: 4300, residualPct: 43.5, residualConfirmed: true },
  { key: 'myrwd', name: 'Model Y RWD', model: 'Model Y', base: 49990, financeDown: 5150, residualPct: 46.0, residualConfirmed: false },
  { key: 'mypre', name: 'Model Y Premium AWD', model: 'Model Y', base: 64990, financeDown: 5150, residualPct: 45.0, residualConfirmed: false },
  { key: 'myperf', name: 'Model Y Performance', model: 'Model Y', base: 74990, financeDown: 5150, residualPct: 43.0, residualConfirmed: false },
];

export const vehicleByKey = (key: string): Vehicle | undefined =>
  VEHICLES.find((v) => v.key === key);

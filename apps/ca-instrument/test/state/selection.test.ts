import { afterEach, describe, it, expect } from 'vitest';
import {
  selectedVehicleKey,
  selectedScenario,
  setMarket,
  financeTermOverride,
} from '@state/settings';
import { DEFAULT_MARKET, marketById } from '@data/markets';

// state is module-global; restore the default market (also resets the selection)
afterEach(() => setMarket('CA'));

describe('default finance term', () => {
  it('CA opens on the realistic 60-mo term, not Tesla’s 96-mo default', () => {
    expect(financeTermOverride.value).toBe(60);
    expect(selectedScenario.value.financeTerm).toBe(60);
  });

  it('switching to the US falls back to per-trim terms; back to CA restores 60', () => {
    setMarket('US');
    expect(financeTermOverride.value).toBe(null); // US prices term per trim
    setMarket('CA');
    expect(financeTermOverride.value).toBe(60);
  });
});

describe('selected-trim state', () => {
  it('defaults to the first vehicle of the default market', () => {
    expect(selectedVehicleKey.value).toBe(DEFAULT_MARKET.vehicles[0].key);
    expect(selectedScenario.value.vehicle.key).toBe(DEFAULT_MARKET.vehicles[0].key);
  });

  it('selectedScenario tracks selectedVehicleKey', () => {
    selectedVehicleKey.value = 'myperf';
    expect(selectedScenario.value.vehicle.key).toBe('myperf');
    expect(selectedScenario.value.vehicle.name).toBe('Model Y Performance');
  });

  it('setMarket resets the selection to the new market first vehicle', () => {
    selectedVehicleKey.value = 'myperf';
    setMarket('US');
    expect(selectedVehicleKey.value).toBe(marketById('US').vehicles[0].key);
  });
});

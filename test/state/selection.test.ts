import { afterEach, describe, it, expect } from 'vitest';
import { selectedVehicleKey, selectedScenario, setMarket } from '@state/settings';
import { DEFAULT_MARKET, marketById } from '@data/markets';

// state is module-global; restore the default market (also resets the selection)
afterEach(() => setMarket('CA'));

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

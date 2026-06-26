// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { ScenarioTable } from '@ui/components/ScenarioTable';
import { taxRegionCode, taxOverride, selectedVehicleKey, financeTermOverride } from '@state/settings';
import { VEHICLES } from '@data/vehicles';

// Capture the module defaults so a test that pins a region or selects a trim
// can't leak into the next one (these signals are module-global, untouched by
// render cleanup).
const region0 = taxRegionCode.peek();
const override0 = taxOverride.peek();
const sel0 = selectedVehicleKey.peek();
const term0 = financeTermOverride.peek();
afterEach(() => {
  cleanup();
  taxRegionCode.value = region0;
  taxOverride.value = override0;
  selectedVehicleKey.value = sel0;
  financeTermOverride.value = term0;
});

describe('<ScenarioTable>', () => {
  it('renders three method rows per vehicle', () => {
    const { container } = render(<ScenarioTable />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(VEHICLES.length * 3);
  });

  it('highlights exactly one best 8-yr-net cell per vehicle', () => {
    const { container } = render(<ScenarioTable />);
    expect(container.querySelectorAll('td.best')).toHaveLength(VEHICLES.length);
  });

  it('flags every estimated-residual vehicle with a "lease est" tag', () => {
    const { container } = render(<ScenarioTable />);
    const estimated = VEHICLES.filter((v) => !v.residualConfirmed).length;
    expect(container.querySelectorAll('.tag')).toHaveLength(estimated);
  });

  it('shows the validated Model 3 RWD finance payment ($549/mo, Ontario 13%, 96 mo)', () => {
    // The $549 figure was read off tesla.com for Ontario at Tesla's 96-mo term;
    // pin the province AND the term (the page now opens on a realistic 60 mo) so
    // the assertion stays tied to that validated quote.
    taxRegionCode.value = 'ON';
    taxOverride.value = null;
    financeTermOverride.value = 96;
    const { getByText } = render(<ScenarioTable />);
    // first cell of the first finance row
    expect(getByText('Model 3 Premium RWD')).toBeTruthy();
    expect(getByText('$549')).toBeTruthy();
  });

  it('marks the selected vehicle row group with .sel', () => {
    selectedVehicleKey.value = 'm3perf';
    const { container } = render(<ScenarioTable />);
    expect(container.querySelectorAll('tr.sel')).toHaveLength(3);
  });

  it('clicking a row selects that vehicle', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<ScenarioTable />);
    fireEvent.click(getByText('Model Y Performance'));
    expect(selectedVehicleKey.value).toBe('myperf');
  });
});

// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { ScenarioTable } from '@ui/components/ScenarioTable';
import { VEHICLES } from '@data/vehicles';
import { selectedVehicleKey, setMarket } from '@state/settings';

afterEach(() => { setMarket('CA'); cleanup(); });

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

  it('shows the validated Model 3 RWD finance payment ($549/mo, CAD default)', () => {
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

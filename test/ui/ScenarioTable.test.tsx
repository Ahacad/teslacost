// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { ScenarioTable } from '@ui/components/ScenarioTable';
import { taxRegionCode, taxOverride } from '@state/settings';
import { VEHICLES } from '@data/vehicles';

afterEach(cleanup);

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

  it('shows the validated Model 3 RWD finance payment ($549/mo, Ontario 13%)', () => {
    // The $549 figure was read off tesla.com for Ontario; pin the province so the
    // assertion stays tied to that quote regardless of the default market region.
    taxRegionCode.value = 'ON';
    taxOverride.value = null;
    const { getByText } = render(<ScenarioTable />);
    // first cell of the first finance row
    expect(getByText('Model 3 Premium RWD')).toBeTruthy();
    expect(getByText('$549')).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { TrimSelector } from '@ui/components/TrimSelector';
import { selectedVehicleKey, setMarket } from '@state/settings';

afterEach(() => { setMarket('CA'); cleanup(); });

describe('<TrimSelector>', () => {
  it('renders a toggle for each model family', () => {
    const { getByText } = render(<TrimSelector />);
    expect(getByText('Model 3')).toBeTruthy();
    expect(getByText('Model Y')).toBeTruthy();
  });

  it('clicking a trim chip updates selectedVehicleKey', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<TrimSelector />);
    fireEvent.click(getByText('Performance'));
    expect(selectedVehicleKey.value).toBe('m3perf');
  });

  it('clicking a model toggle selects that family first trim', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<TrimSelector />);
    fireEvent.click(getByText('Model Y'));
    expect(selectedVehicleKey.value).toBe('myrwd');
  });
});

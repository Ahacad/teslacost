// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { CarFocus } from '@ui/components/CarFocus';
import { selectedVehicleKey, setMarket } from '@state/settings';

beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(() => { setMarket('CA'); cleanup(); });

describe('<CarFocus>', () => {
  it('shows the selected trim name', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<CarFocus />);
    expect(getByText('Model 3 Premium RWD')).toBeTruthy();
  });

  it('reflects a different selection', () => {
    selectedVehicleKey.value = 'myperf';
    const { getByText } = render(<CarFocus />);
    expect(getByText('Model Y Performance')).toBeTruthy();
  });

  it('renders the car poster image', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { container } = render(<CarFocus />);
    expect(container.querySelector('img.carviewer-poster')).toBeTruthy();
  });
});

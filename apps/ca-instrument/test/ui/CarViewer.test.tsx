// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { CarViewer } from '@ui/components/CarViewer';

// Stub IntersectionObserver so it never fires → the 3D chunk is never imported,
// and the render stays deterministically on the poster.
beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(cleanup);

describe('<CarViewer>', () => {
  it('renders the poster image immediately (before the 3D chunk loads)', () => {
    const { container } = render(
      <CarViewer src="/models/x.glb" poster="/models/x.webp" alt="X car" />,
    );
    const img = container.querySelector('img.carviewer-poster') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/models/x.webp');
    expect(img.getAttribute('alt')).toBe('X car');
  });
});

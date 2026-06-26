// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { Flag } from '@ui/components/Flag';

afterEach(cleanup);

describe('<Flag>', () => {
  it('renders an inline SVG for CA with the maple-leaf red fill', () => {
    const { container } = render(<Flag code="CA" />);
    const svg = container.querySelector('svg.flag-svg');
    expect(svg).toBeTruthy();
    // CA artwork: white field + the #d52b1e leaf/bands, no star marker.
    expect(container.querySelector('path[fill="#d52b1e"]')).toBeTruthy();
    expect(container.querySelector('marker')).toBeNull();
  });

  it('renders an inline SVG for US with a star marker', () => {
    const { container } = render(<Flag code="US" />);
    expect(container.querySelector('svg.flag-svg')).toBeTruthy();
    expect(container.querySelector('path[fill="#192f5d"]')).toBeTruthy(); // canton
    expect(container.querySelector('marker')).toBeTruthy();
  });

  it('gives each US instance a unique marker id so they never collide in one document', () => {
    const { container } = render(
      <div>
        <Flag code="US" />
        <Flag code="US" />
      </div>,
    );
    const ids = [...container.querySelectorAll('marker')].map((m) => m.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('passes through an extra class alongside the base flag-svg class', () => {
    const { container } = render(<Flag code="CA" class="mtab-flag" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('flag-svg')).toBe(true);
    expect(svg?.classList.contains('mtab-flag')).toBe(true);
  });
});

// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { TermBand } from '@ui/components/TermBand';
import { setMarket, financeTermOverride, selectedScenario, FINANCE_TERMS } from '@state/settings';

afterEach(() => { setMarket('CA'); cleanup(); });

/** Find a term chip by its year label (scoped so footnote text can't match). */
const chip = (root: ParentNode, yr: string) =>
  [...root.querySelectorAll('.termchip')].find(
    (c) => c.querySelector('.termchip-yr')?.textContent === yr,
  )!;

describe('<TermBand>', () => {
  it('renders a chip per finance term', () => {
    const { container } = render(<TermBand />);
    expect(container.querySelectorAll('.termchip')).toHaveLength(FINANCE_TERMS.length);
  });

  it('highlights the recommended 5-yr default, not the 8-yr', () => {
    const { container } = render(<TermBand />);
    expect(selectedScenario.value.financeTerm).toBe(60);
    expect(chip(container, '5 yr').className).toContain('on');
    expect(chip(container, '8 yr').className).not.toContain('on');
  });

  it('flags the 8-yr chip as Tesla’s default', () => {
    const { container } = render(<TermBand />);
    expect(chip(container, '8 yr').querySelector('.termchip-note')?.textContent).toBe(
      'Tesla default',
    );
  });

  it('clicking a chip sets the page-wide term and moves the highlight', () => {
    const { container } = render(<TermBand />);
    fireEvent.click(chip(container, '8 yr'));
    expect(financeTermOverride.value).toBe(96);
    expect(chip(container, '8 yr').className).toContain('on');
  });
});

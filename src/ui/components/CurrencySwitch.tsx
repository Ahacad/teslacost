import { useLayoutEffect, useRef } from 'preact/hooks';
import { CURRENCIES } from '@data/currencies';
import { currencyCode, setCurrency } from '@state/settings';

/** Segmented CAD | USD switch with a sliding thumb under the active option. */
export function CurrencySwitch() {
  const segRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const active = currencyCode.value;

  useLayoutEffect(() => {
    const seg = segRef.current;
    const thumb = thumbRef.current;
    if (!seg || !thumb) return;
    const on = seg.querySelector('button.on') as HTMLElement | null;
    if (!on) return;
    thumb.style.width = `${on.offsetWidth}px`;
    thumb.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  });

  return (
    <div class="seg" ref={segRef} role="tablist" aria-label="currency">
      <span class="thumb" ref={thumbRef} />
      {CURRENCIES.map((c) => (
        <button class={active === c.code ? 'on' : ''} onClick={() => setCurrency(c.code)}>
          {c.code}&nbsp;{c.symbol}
        </button>
      ))}
    </div>
  );
}

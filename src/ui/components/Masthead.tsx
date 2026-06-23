import { activeMarket, activeCurrency, activeRate } from '@state/settings';
import { Flag } from './Flag';

export function Masthead() {
  const m = activeMarket.value;
  const cur = activeCurrency.value;
  // Cross-rate note: how many display-currency units per 1 base unit.
  const fxNote =
    cur.code === m.baseCurrencyCode
      ? `base ${m.baseCurrencyCode}`
      : `1 ${m.baseCurrencyCode} = ${activeRate.value.toFixed(4)} ${cur.code}`;

  return (
    <header class="mast reveal">
      <div class="rail">
        <div class="brand">
          TESLA<span class="ca">·</span>
          {m.id}
        </div>
        <div class="meta">
          Cost Instrument
          <br />
          Model 3 / Model Y
          <br />
          <span>
            <Flag code={m.id} class="meta-flag" /> {m.label} · {fxNote}
          </span>
        </div>
      </div>
      <p class="kick">
        A field guide to what a Tesla <b>actually costs</b> in {m.label} — financed, leased, or paid
        in cash. Every number recomputes as you change the dials.
      </p>
    </header>
  );
}

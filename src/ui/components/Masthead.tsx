import { rates } from '@state/settings';
import { FALLBACK_RATES } from '@data/currencies';

export function Masthead() {
  const usd = rates.value.USD ?? FALLBACK_RATES.USD;
  return (
    <header class="mast reveal">
      <div class="rail">
        <div class="brand">
          TESLA<span class="ca">·</span>CA
        </div>
        <div class="meta">
          Cost Instrument
          <br />
          Model 3 / Model Y
          <br />
          <span>1 CAD = {usd.toFixed(4)} USD</span>
        </div>
      </div>
      <p class="kick">
        A field guide to what a Tesla <b>actually costs</b> in Canada — financed, leased, or paid in
        cash. Every number recomputes as you change the dials.
      </p>
    </header>
  );
}

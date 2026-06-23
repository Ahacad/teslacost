import { selectedTermQuotes, selectedScenario, financeTermOverride } from '@state/settings';
import { money } from '@state/format';

/** "60" → "5 yr"; keeps an odd term in months. */
const label = (m: number) => (m % 12 === 0 ? `${m / 12} yr` : `${m} mo`);

/**
 * The primary financing control: pick the loan length for the selected car and
 * the whole page reprices. Opens on the realistic recommended term (5 yr), not
 * Tesla's 96-mo default. Each chip shows that car's real monthly at that term,
 * so the trade-off is visible before clicking.
 */
export function TermBand() {
  const quotes = selectedTermQuotes.value;
  const car = selectedScenario.value.vehicle;
  const activeTerm = selectedScenario.value.financeTerm; // resolved effective term
  const lo = Math.min(...quotes.map((q) => q.apr));
  const hi = Math.max(...quotes.map((q) => q.apr));
  const anyEst = quotes.some((q) => !q.confirmed);

  return (
    <div class="termband reveal" style={{ animationDelay: '.08s' }}>
      <div class="termband-head">
        <div class="lead">how long will you finance?</div>
        <div class="termband-sub">
          {car.name} · rate {lo.toFixed(2)}%–{hi.toFixed(2)}% by term
        </div>
      </div>

      <div class="termchips" role="tablist" aria-label="finance term">
        {quotes.map((q) => {
          const on = q.months === activeTerm;
          return (
            <button
              class={`termchip ${on ? 'on' : ''}`}
              role="tab"
              aria-selected={on}
              onClick={() => (financeTermOverride.value = q.months)}
            >
              <span class="termchip-yr">{label(q.months)}</span>
              <span class="termchip-mo">
                {money(q.monthly)}
                <small>/mo</small>
              </span>
              <span class="termchip-apr">
                {q.apr.toFixed(2)}%{q.confirmed ? '' : ' est'}
              </span>
              {q.months === 96 && <span class="termchip-note">Tesla default</span>}
            </button>
          );
        })}
      </div>

      <div class="ssub" style={{ paddingLeft: 0, marginTop: '10px' }}>
        Opens on <b>5 yr</b>. A longer term shaves the monthly but carries a higher rate and far
        more interest — <b>8 yr</b> is Tesla's own default and the costliest way to borrow. Pick one;
        the table and charts below all follow.
        {anyEst && ' Shorter-term rates are estimated (see “Your finance terms” for the breakdown).'}
      </div>
    </div>
  );
}

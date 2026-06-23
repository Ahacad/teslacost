import { activeMarket } from '@state/settings';
import { money } from '@state/format';

/** The three-up explainer of finance vs lease vs cash. Copy follows the market. */
export function Decide() {
  const m = activeMarket.value;
  const cfg = m.config;
  const finTerm = cfg.finance.termMonths;
  const leaseTerm = cfg.lease.termMonths;
  const bases = m.vehicles.map((v) => v.base);
  const lo = money(Math.min(...bases));
  const hi = money(Math.max(...bases));
  const financeTaxNote = cfg.taxInFinancedPrincipal
    ? 'Tax rolls into the loan.'
    : 'Sales tax is paid up front, not financed.';

  return (
    <div class="decide reveal" style={{ animationDelay: '.1s', marginTop: '22px' }}>
      <div>
        <h4 class="f">Finance</h4>
        <p>
          Borrow, pay for up to <b>{finTerm} mo</b>, then you <b>own it</b>. Highest monthly, but the
          cheapest route to ownership once you bank the resale. {financeTaxNote}
        </p>
      </div>
      <div>
        <h4 class="l">Lease</h4>
        <p>
          Rent for <b>{leaseTerm} mo</b>, then hand it back. Lower commitment, always near-new under
          warranty, and you only pay tax on the <b>payments</b> — never the residual. You own nothing.
        </p>
      </div>
      <div>
        <h4 class="c">Cash</h4>
        <p>
          Pay once, no interest, own outright. But you tie up {lo}–{hi} and pay every dollar of tax up
          front.
        </p>
      </div>
    </div>
  );
}

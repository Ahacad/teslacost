/** The three-up explainer of finance vs lease vs cash. Static copy. */
export function Decide() {
  return (
    <div class="decide reveal" style={{ animationDelay: '.1s', marginTop: '22px' }}>
      <div>
        <h4 class="f">Finance</h4>
        <p>
          Borrow, pay for <b>96 mo</b>, then you <b>own it</b>. Highest monthly, but the cheapest
          route to ownership once you bank the resale. Tax rolls into the loan.
        </p>
      </div>
      <div>
        <h4 class="l">Lease</h4>
        <p>
          Rent for <b>48 mo</b>, then hand it back. Lower commitment, always near-new under
          warranty, and you only pay tax on the <b>payments</b> — never the residual. You own
          nothing.
        </p>
      </div>
      <div>
        <h4 class="c">Cash</h4>
        <p>Pay once, no interest, own outright. But you tie up $48–88k and pay every dollar of tax up front.</p>
      </div>
    </div>
  );
}

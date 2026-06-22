/** Collapsible glossary + the finance/lease formulas. Static reference copy. */
export function Glossary() {
  return (
    <details>
      <summary>
        <span class="chev">▸</span>Glossary &amp; the formulas
      </summary>
      <div class="dbody">
        <b>APR</b> — annual loan interest. Monthly rate <code>i = APR / 12</code>.<br />
        <b>Money Factor (MF)</b> — how leases state interest: <code>MF = APR / 2400</code> (4.93% → 0.002053).<br />
        <b>Residual</b> — Tesla's predicted value at lease end. You finance only the <i>drop</i> in value — that's why leases cost less per month.<br />
        <b>Adjusted cap cost</b> — the lease "price": <code>price + fees − down − incentives</code>.<br />
        <b>Depreciation</b> (lease) — <code>(adjCap − residual) / term</code>.<br />
        <b>Rent charge</b> (lease) — <code>(adjCap + residual) × MF</code> — the interest part.<br />
        <b>HST / PST / GST</b> — provincial sales tax, added at checkout (not in Tesla's quote). Finance rolls it in; lease charges it per payment, so you skip tax on the residual.<br />
        <b>Fees ($2,642)</b> — freight/PDI + A/C &amp; tire levies, in every quote.
        <hr />
        <b>Finance:</b> <code>M = P·i / (1 − (1+i)^−n)</code>, <code>P = price+fees+tax − down</code>.<br />
        <b>Lease:</b> <code>M = (adjCap − residual)/n + (adjCap + residual)·MF</code>, then × (1 + tax).<br />
        Both reproduce tesla.com's client-side "finplat" engine to the dollar.
      </div>
    </details>
  );
}

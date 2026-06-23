import { activeMarket } from '@state/settings';

/** Trust note + provenance, per market. */
export function Footer() {
  const id = activeMarket.value.id;

  if (id === 'US') {
    return (
      <div class="foot" id="foot">
        <b>Trust:</b> every finance and lease payment reproduces tesla.com/en_us <b>to the dollar</b> —
        each trim carries its current APR/term (promos included) and its lease money factor + residual,
        read off Tesla's own schedule. <b>No federal EV tax credit</b> is applied (the IRA 30D credit
        ended Sept 2025). Tesla's quoted payments exclude sales tax; US sales tax is state-level, so set
        your state or type a custom % — it's added up front for finance/cash and per-payment for a lease.
        Insurance, charging, and resale% are overridable estimates. FSD $99/mo. Source:{' '}
        <code>reference/tesla_us_data_2026-06-22.md</code>. Snapshot 2026-06-22 (USD).
      </div>
    );
  }

  return (
    <div class="foot" id="foot">
      <b>Trust:</b> finance matches tesla.com to the dollar; Model 3 lease matches within ~$3 ($542
      computed vs $539 shown). Model Y lease is an estimate (residual assumed —{' '}
      <span class="tag">lease est</span>). Tax, insurance, charging, resale% are overridable
      estimates. FSD $99/mo + Premium Connectivity $13.99/mo are current CA prices (one-time FSD
      purchase ended Feb 2026). Companion files in <code>reference/</code>:{' '}
      <code>tesla_scenarios.md</code> · <code>tesla_other_costs.md</code> ·{' '}
      <code>tesla_scenarios.csv</code> · <code>tesla_finance_notes.md</code>. Snapshot 2026-06-21.
    </div>
  );
}

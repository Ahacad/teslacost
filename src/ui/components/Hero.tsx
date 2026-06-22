import { scenarios } from '@state/settings';
import { money } from '@state/format';
import { AnimatedMoney } from './Money';
import { CurrencySwitch } from './CurrencySwitch';

/** Headline: the single cheapest all-in monthly across the whole lineup. */
export function Hero() {
  const list = scenarios.value;
  let low = { name: '', method: '', val: Infinity };
  for (const s of list) {
    for (const [label, d] of [
      ['Finance', s.methods.finance],
      ['Lease', s.methods.lease],
    ] as const) {
      if (d.pay > 0 && d.allIn < low.val) low = { name: s.vehicle.name, method: label, val: d.allIn };
    }
  }
  const first = list[0];

  return (
    <div class="hero reveal" style={{ animationDelay: '.06s' }}>
      <div>
        <div class="lead">cheapest way in, all-in monthly</div>
        <div class="big">
          <span class="amt num">
            <AnimatedMoney value={low.val} />
          </span>{' '}
          <span class="u">/mo</span>
        </div>
        <div class="lead" style={{ marginTop: '4px' }}>
          {low.name} · {low.method} · {money(first.methods.finance.upfront)} down to start
        </div>
      </div>
      <CurrencySwitch />
    </div>
  );
}

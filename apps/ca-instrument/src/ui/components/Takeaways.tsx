import { scenarios } from '@state/settings';
import { money } from '@state/format';
import { AnimatedMoney } from './Money';

interface Card {
  lab: string;
  val: number;
  d: string;
  suffix?: string;
}

/** Four headline answers, derived live from the full scenario set. */
export function Takeaways() {
  const list = scenarios.value;
  let lowMo = { name: '', method: '', val: Infinity };
  let cheapOwn = { name: '', method: '', val: Infinity };
  let gap = { name: '', val: 0, pricier: true };

  for (const s of list) {
    for (const [label, d] of [
      ['Finance', s.methods.finance],
      ['Lease', s.methods.lease],
    ] as const) {
      if (d.pay > 0 && d.allIn < lowMo.val) lowMo = { name: s.vehicle.name, method: label, val: d.allIn };
    }
    if (s.methods.finance.net8 < cheapOwn.val)
      cheapOwn = { name: s.vehicle.name, method: 'Finance', val: s.methods.finance.net8 };
    if (s.methods.cash.net8 < cheapOwn.val)
      cheapOwn = { name: s.vehicle.name, method: 'Cash', val: s.methods.cash.net8 };
    const g = s.methods.lease.pay - s.methods.finance.pay;
    if (Math.abs(g) > gap.val) gap = { name: s.vehicle.name, val: Math.abs(g), pricier: g > 0 };
  }

  const first = list[0];
  const cards: Card[] = [
    { lab: 'Lowest all-in / month', val: lowMo.val, d: `${lowMo.name} · ${lowMo.method}` },
    { lab: 'Cheapest to OWN · 8-yr net', val: cheapOwn.val, d: `${cheapOwn.name} · ${cheapOwn.method}` },
    {
      lab: 'Entry point · M3 RWD',
      val: first.methods.finance.allIn,
      d: `Finance all-in · ${money(first.methods.finance.upfront)} down`,
      suffix: '/mo',
    },
    {
      lab: 'Lease vs Finance gap',
      val: gap.val,
      d: `${gap.name} · lease ${gap.pricier ? 'pricier' : 'cheaper'}`,
      suffix: '/mo',
    },
  ];

  return (
    <div class="take reveal" id="takeaways">
      {cards.map((c) => (
        <div class="k">
          <div class="lab">{c.lab}</div>
          <div class="v num">
            <AnimatedMoney value={c.val} suffix={c.suffix} />
          </div>
          <div class="d">{c.d}</div>
        </div>
      ))}
    </div>
  );
}

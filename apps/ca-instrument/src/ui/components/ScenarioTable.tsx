import type { MethodResult, ScenarioResult } from '@domain/types';
import { scenarios, activeMarket, selectedVehicleKey } from '@state/settings';
import { money } from '@state/format';

const HEADERS: Array<[string, string]> = [
  ['Vehicle', 'The car: vehicle + mandatory fees.'],
  ['Method', 'Finance = loan you own at the end · Lease = rent then return · Cash = pay once.'],
  ['Payment/mo', "Tesla's financing payment, with sales tax where your market applies it to the payment."],
  ['+ Running', '+ running costs: Premium Connectivity, home charging, tires/maintenance.'],
  ['+ Insurance', '+ an insurance estimate. Not a Tesla cost and varies a lot — get a real quote.'],
  ['= All-in/mo', '+ FSD if toggled on. This is your true out-the-door monthly.'],
  ['Upfront', 'Cash needed up front: down payment (+ tax on a lease down / up-front sales tax), or full price for Cash.'],
  ['Total/term', 'Every financing payment summed over the term (car only).'],
  ['8-yr net', 'Fair 8-year cost: finance keeps it, lease re-leases to fill the window, cash keeps it — minus estimated resale where you keep the car. Lowest = best.'],
];

function Row({
  s,
  label,
  cls,
  d,
  first,
  bestNet,
}: {
  s: ScenarioResult;
  label: string;
  cls: string;
  d: MethodResult;
  first: boolean;
  bestNet: number;
}) {
  const mcls = s.vehicle.model === 'Model 3' ? 'm3' : 'my';
  const plusRun = d.pay + s.running;
  const plusIns = plusRun + s.insurance;
  const isBest = Math.abs(d.net8 - bestNet) < 1;
  return (
    <tr
      class={`${first ? 'grp ' : ''}${s.vehicle.key === selectedVehicleKey.value ? 'sel' : ''}`}
      onClick={() => (selectedVehicleKey.value = s.vehicle.key)}
    >
      <td>
        {first && (
          <>
            <span class={`vname ${mcls}`}>{s.vehicle.name}</span>
            {!s.vehicle.residualConfirmed && <span class="tag">lease est</span>}
          </>
        )}
      </td>
      <td>
        <span class={`mlabel ${cls}`}>{label}</span>
      </td>
      <td class="num">{d.pay ? money(d.pay) : '—'}</td>
      <td class="num">{d.pay ? money(plusRun) : money(s.running)}</td>
      <td class="num">{d.pay ? money(plusIns) : money(s.running + s.insurance)}</td>
      <td class="num allin">{money(d.allIn)}</td>
      <td class="num">{money(d.upfront)}</td>
      <td class="num">{money(d.totalTerm)}</td>
      <td class={`num ${isBest ? 'best' : ''}`}>{money(d.net8)}</td>
    </tr>
  );
}

export function ScenarioTable() {
  return (
    <div class="card scroll reveal">
      <table id="scenTable">
        <thead>
          <tr>
            {HEADERS.map(([title, tip], i) => (
              <th title={tip}>
                {title} {i >= 2 && <span class="q">?</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.value.map((s) => {
            const cfg = activeMarket.value.config;
            const bestNet = Math.min(s.methods.finance.net8, s.methods.lease.net8, s.methods.cash.net8);
            const rows: Array<[string, string, MethodResult]> = [
              [`Finance ${s.financeTerm}mo`, 'fin', s.methods.finance],
              [`Lease ${cfg.lease.termMonths}mo`, 'lse', s.methods.lease],
              ['Cash', 'csh', s.methods.cash],
            ];
            return rows.map(([label, cls, d], idx) => (
              <Row s={s} label={label} cls={cls} d={d} first={idx === 0} bestNet={bestNet} />
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

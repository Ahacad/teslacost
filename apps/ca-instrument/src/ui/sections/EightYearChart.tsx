import { scenarios } from '@state/settings';
import { COL } from '../colors';
import { shortName } from '../charts/chart-math';
import { BarChart } from '../charts/BarChart';
import { Legend } from '../components/Legend';

/** Chart C: 8-year net cost per trim, finance vs lease vs cash. */
export function EightYearChart() {
  const groups = scenarios.value.map((s) => ({
    label: shortName(s.vehicle.name),
    full: s.vehicle.name,
    vals: [s.methods.finance.net8, s.methods.lease.net8, s.methods.cash.net8],
  }));
  return (
    <div class="card pad reveal">
      <Legend items={[
        ['Finance · net of resale', COL.fin],
        ['Lease ×2 · gross', COL.lse],
        ['Cash · net', COL.csh],
      ]} />
      <BarChart
        groups={groups}
        series={[
          { name: 'Finance', color: COL.fin },
          { name: 'Lease', color: COL.lse },
          { name: 'Cash', color: COL.csh },
        ]}
        height={320}
      />
    </div>
  );
}

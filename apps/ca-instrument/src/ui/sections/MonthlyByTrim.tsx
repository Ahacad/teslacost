import { scenarios } from '@state/settings';
import { COL } from '../colors';
import { shortName } from '../charts/chart-math';
import { BarChart } from '../charts/BarChart';
import { Legend } from '../components/Legend';

/** Chart A: all-in monthly, finance vs lease, one group per trim. */
export function MonthlyByTrim() {
  const groups = scenarios.value.map((s) => ({
    label: shortName(s.vehicle.name),
    full: s.vehicle.name,
    vals: [s.methods.finance.allIn, s.methods.lease.allIn],
  }));
  return (
    <div class="card pad reveal">
      <Legend items={[
        ['Finance all-in/mo', COL.fin],
        ['Lease all-in/mo', COL.lse],
      ]} />
      <BarChart
        groups={groups}
        series={[
          { name: 'Finance', color: COL.fin },
          { name: 'Lease', color: COL.lse },
        ]}
      />
    </div>
  );
}

import { useState } from 'preact/hooks';
import { scenarios } from '@state/settings';
import { CONFIG } from '@data/config';
import { cumulativePoints } from '@domain/cumulative';
import { COL } from '../colors';
import { LineChart } from '../charts/LineChart';
import { Legend } from '../components/Legend';

/** Chart B: cumulative cash over 8 years for one vehicle, with an extras overlay. */
export function CumulativeChart() {
  const list = scenarios.value;
  const [key, setKey] = useState(list[0].vehicle.key);
  const [overlay, setOverlay] = useState(false);

  const s = list.find((x) => x.vehicle.key === key) ?? list[0];
  const opts = {
    months: CONFIG.horizonMonths,
    includeExtra: overlay,
    leaseTermMonths: CONFIG.lease.termMonths,
  };
  const extraTotal = overlay ? s.extra * CONFIG.horizonMonths : 0;
  const lines = [
    { name: 'Cash', color: COL.csh, pts: cumulativePoints('cash', s, opts), dashEnd: s.methods.cash.net8 + extraTotal },
    { name: 'Finance', color: COL.fin, pts: cumulativePoints('finance', s, opts), dashEnd: s.methods.finance.net8 + extraTotal },
    { name: 'Lease ×2', color: COL.lse, pts: cumulativePoints('lease', s, opts) },
  ];

  return (
    <div class="card pad reveal">
      <div class="controls" style={{ marginBottom: '14px' }}>
        <div class="ctrl">
          <label>Vehicle</label>
          <select value={key} onChange={(e) => setKey((e.currentTarget as HTMLSelectElement).value)}>
            {list.map((x) => (
              <option value={x.vehicle.key}>{x.vehicle.name}</option>
            ))}
          </select>
        </div>
        <div class="ctrl">
          <label>Overlay</label>
          <label class="sw">
            <input
              type="checkbox"
              checked={overlay}
              onChange={(e) => setOverlay((e.currentTarget as HTMLInputElement).checked)}
            />
            <span class="track" />
            add running + insurance + FSD
          </label>
        </div>
      </div>
      <Legend items={[
        ['Cash', COL.csh],
        ['Finance · keep', COL.fin],
        ['Lease ×2 · return', COL.lse],
      ]} />
      <LineChart lines={lines} />
    </div>
  );
}

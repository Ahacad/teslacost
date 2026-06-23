import { useState } from 'preact/hooks';
import { selectedScenario } from '@state/settings';
import { assetFor } from '@data/models3d';
import { money } from '@state/format';
import { AnimatedMoney } from './Money';
import { CurrencySwitch } from './CurrencySwitch';
import { TrimSelector } from './TrimSelector';
import { CarViewer } from './CarViewer';

// Visual-only paint chips (no cost effect) — the recolor is purely cosmetic.
const PAINTS: Array<[string, string]> = [
  ['Pearl White', '#e9e9ea'],
  ['Solid Black', '#1c1c1e'],
  ['Stealth Grey', '#5b5e62'],
  ['Deep Blue', '#1f3a63'],
  ['Ultra Red', '#a31212'],
];

function Num({ lab, val, sub, suffix }: { lab: string; val: number; sub: string; suffix?: string }) {
  return (
    <div class="carfocus-num">
      <div class="lab">{lab}</div>
      <div class="v num"><AnimatedMoney value={val} suffix={suffix} /></div>
      <div class="d">{sub}</div>
    </div>
  );
}

/** The "your car" focus panel: selector + 3D car + that trim's numbers. */
export function CarFocus() {
  const [paint, setPaint] = useState(PAINTS[0][1]);
  const s = selectedScenario.value;
  const asset = assetFor(s.vehicle);
  const m = s.methods;

  return (
    <div class="carfocus reveal" style={{ animationDelay: '.06s' }}>
      <div class="carfocus-head">
        <div>
          <div class="lead">your car</div>
          <div class="carfocus-name">{s.vehicle.name}</div>
        </div>
        <CurrencySwitch />
      </div>

      <TrimSelector />

      <div class="carfocus-body">
        <div class="carfocus-stage">
          <CarViewer
            src={asset.glb}
            poster={asset.poster}
            alt={`${s.vehicle.name} 3D model`}
            paintHex={paint}
          />
          <div class="paints" role="listbox" aria-label="paint">
            {PAINTS.map(([name, hex]) => (
              <button
                class={`swatch ${paint === hex ? 'on' : ''}`}
                title={name}
                aria-label={name}
                style={{ background: hex }}
                onClick={() => setPaint(hex)}
              />
            ))}
          </div>
        </div>

        <div class="carfocus-nums">
          <Num lab="Finance · all-in / mo" val={m.finance.allIn} suffix="/mo" sub={`${money(m.finance.upfront)} down`} />
          <Num lab="Lease · all-in / mo" val={m.lease.allIn} suffix="/mo" sub={`${money(m.lease.upfront)} to start`} />
          <Num lab="Cash · drive-off" val={m.cash.upfront} sub="full price, taxes in" />
          <Num lab="8-yr net · finance" val={m.finance.net8} sub="net of resale" />
        </div>
      </div>
    </div>
  );
}

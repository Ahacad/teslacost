import type { JSX } from 'preact';
import { PROVINCES } from '@data/tax';
import { RUNNING_COSTS } from '@data/costs';
import {
  taxRate,
  downMode,
  customDown,
  includeRunning,
  includeInsurance,
  includeFsd,
  fsdPrice,
  rates,
  currencyCode,
  setRate,
} from '@state/settings';
import type { DownMode } from '@domain/scenario';
import { money, display, toBaseValue } from '@state/format';

const numVal = (e: Event) => +(e.currentTarget as HTMLInputElement).value;

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: JSX.Element | string | (JSX.Element | string)[];
}) {
  return (
    <label class="sw">
      <input type="checkbox" checked={checked} onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)} />
      <span class="track" />
      {children}
    </label>
  );
}

export function Controls() {
  const dm = downMode.value;
  const m3 = RUNNING_COSTS['Model 3'];
  const run = includeRunning.value ? m3.connectivity + m3.charging + m3.maintenance : 0;
  const ins = includeInsurance.value ? m3.insurance : 0;
  const usd = rates.value.USD ?? 0.7068;

  return (
    <>
      <div class="card pad controls reveal">
        <div class="ctrl">
          <label>Province (tax)</label>
          <select value={String(taxRate.value)} onChange={(e) => (taxRate.value = numVal(e))}>
            {PROVINCES.map((p) => (
              <option value={String(p.rate)}>{p.label}</option>
            ))}
          </select>
        </div>

        <div class="ctrl">
          <label>Down payment</label>
          <select
            value={dm === 'default' || dm === 'custom' ? dm : String(dm)}
            onChange={(e) => {
              const v = (e.currentTarget as HTMLSelectElement).value;
              downMode.value = (v === 'default' || v === 'custom' ? v : +v) as DownMode;
            }}
          >
            <option value="default">Tesla default</option>
            <option value="0">$0 down</option>
            <option value="10000">$10,000</option>
            <option value="custom">Custom…</option>
          </select>
        </div>

        {dm === 'custom' && (
          <div class="ctrl">
            <label>Custom down</label>
            <input
              type="number"
              step="500"
              style={{ width: '108px' }}
              value={display(customDown.value)}
              onInput={(e) => (customDown.value = toBaseValue(numVal(e)))}
            />
          </div>
        )}

        <div class="ctrl">
          <label>FX · 1 CAD = USD</label>
          <input
            type="number"
            step="0.0001"
            style={{ width: '92px' }}
            value={usd.toFixed(4)}
            onInput={(e) => setRate('USD', numVal(e) || 0.7068)}
          />
        </div>

        <div class="ctrl">
          <label>Running costs</label>
          <Toggle checked={includeRunning.value} onChange={(v) => (includeRunning.value = v)}>
            charging + tires + connectivity
          </Toggle>
        </div>

        <div class="ctrl">
          <label>Insurance (est.)</label>
          <Toggle checked={includeInsurance.value} onChange={(v) => (includeInsurance.value = v)}>
            include
          </Toggle>
        </div>

        <div class="ctrl">
          <label>FSD subscription</label>
          <Toggle checked={includeFsd.value} onChange={(v) => (includeFsd.value = v)}>
            ${' '}
            <input
              type="number"
              value={display(fsdPrice.value)}
              step="1"
              style={{ width: '56px', padding: '5px 7px' }}
              onInput={(e) => (fsdPrice.value = toBaseValue(numVal(e)))}
            />
            /mo
          </Toggle>
        </div>
      </div>

      <div class="ssub" style={{ paddingLeft: 0, marginTop: '12px' }}>
        Running + insurance ≈ <b>{money(run + ins)}/mo</b> on a Model 3
        {includeFsd.value ? ` · + FSD ${money(fsdPrice.value)}` : ''} · tax{' '}
        {(taxRate.value * 100).toFixed(2)}% · showing <b>{currencyCode.value}</b>
        {currencyCode.value !== 'CAD' ? ` @ ${usd.toFixed(4)}` : ''}.
      </div>
    </>
  );
}

import type { JSX } from 'preact';
import {
  activeMarket,
  taxRate,
  downMode,
  customDown,
  includeRunning,
  includeInsurance,
  includeFsd,
  fsdPrice,
  aprOverride,
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
  const market = activeMarket.value;
  const dm = downMode.value;
  const refModel = market.vehicles[0].model;
  const rc = market.config.running[refModel] ?? { connectivity: 0, charging: 0, maintenance: 0, insurance: 0 };
  const runRef = rc.connectivity + rc.charging + rc.maintenance;
  const usd = rates.value.USD ?? 0.7068;

  const taxLabel = market.id === 'US' ? 'State (tax)' : 'Province (tax)';
  const knownTax = market.taxRegions.some((r) => r.rate === taxRate.value);

  return (
    <>
      <div class="card pad controls reveal">
        <div class="ctrl">
          <label>{taxLabel}</label>
          <select value={String(taxRate.value)} onChange={(e) => (taxRate.value = numVal(e))}>
            {market.taxRegions.map((r) => (
              <option value={String(r.rate)}>{r.label}</option>
            ))}
            {!knownTax && (
              <option value={String(taxRate.value)}>Custom · {(taxRate.value * 100).toFixed(2)}%</option>
            )}
          </select>
        </div>

        <div class="ctrl">
          <label>Tax % override</label>
          <input
            type="number"
            step="0.25"
            style={{ width: '78px' }}
            value={(taxRate.value * 100).toFixed(2)}
            onInput={(e) => (taxRate.value = (numVal(e) || 0) / 100)}
          />
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
            <option value="10000">{money(10000)}</option>
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
          <label>APR % override</label>
          <input
            type="number"
            step="0.1"
            placeholder="auto"
            style={{ width: '84px' }}
            value={aprOverride.value ?? ''}
            onInput={(e) => {
              const raw = (e.currentTarget as HTMLInputElement).value;
              aprOverride.value = raw === '' ? null : +raw;
            }}
          />
        </div>

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
            <span class="swsub">charging + connectivity + tires</span>
            <b class="swnum">{money(runRef)}/mo</b>
          </Toggle>
        </div>

        <div class="ctrl">
          <label>Insurance (est.)</label>
          <Toggle checked={includeInsurance.value} onChange={(v) => (includeInsurance.value = v)}>
            <b class="swnum">{money(rc.insurance)}/mo</b>
          </Toggle>
        </div>

        <div class="ctrl">
          <label>FSD subscription</label>
          <Toggle checked={includeFsd.value} onChange={(v) => (includeFsd.value = v)}>
            <span class="swnum" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              $
              <input
                type="number"
                value={display(fsdPrice.value)}
                step="1"
                style={{ width: '56px', padding: '5px 7px' }}
                onInput={(e) => (fsdPrice.value = toBaseValue(numVal(e)))}
              />
              /mo
            </span>
          </Toggle>
        </div>
      </div>

      <div class="ssub" style={{ paddingLeft: 0, marginTop: '12px' }}>
        Estimates — running <b>{money(runRef)}/mo</b> + insurance <b>{money(rc.insurance)}/mo</b> on a{' '}
        {refModel} · FSD <b>{money(fsdPrice.value)}/mo</b> · tax {(taxRate.value * 100).toFixed(2)}%
        {aprOverride.value != null ? ` · APR forced ${aprOverride.value}%` : ' · live promo APRs'} · showing{' '}
        <b>{currencyCode.value}</b>
        {currencyCode.value !== market.baseCurrencyCode ? ` @ ${usd.toFixed(4)}` : ''}.
      </div>
    </>
  );
}

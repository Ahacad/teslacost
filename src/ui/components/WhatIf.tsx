import { useState } from 'preact/hooks';
import { financeMonthly } from '@domain/finance';
import { leaseMonthly } from '@domain/lease';
import { resolveDown } from '@domain/scenario';
import { CONFIG } from '@data/config';
import { VEHICLES, vehicleByKey } from '@data/vehicles';
import { taxRate, downMode, customDown, activeCurrency } from '@state/settings';
import { money, display, toBaseValue } from '@state/format';

type Mode = 'finance' | 'lease';
const num = (e: Event) => +(e.currentTarget as HTMLInputElement).value;

export function WhatIf() {
  const [key, setKey] = useState(VEHICLES[0].key);
  const [mode, setMode] = useState<Mode>('finance');
  const [price, setPrice] = useState(0);
  const [down, setDown] = useState(0);
  const [apr, setApr] = useState(CONFIG.finance.apr);
  const [term, setTerm] = useState(CONFIG.finance.termMonths);
  const [resid, setResid] = useState(0);
  const [sig, setSig] = useState('');

  const v = vehicleByKey(key) ?? VEHICLES[0];
  const isLease = mode === 'lease';
  const tax = taxRate.value;

  // Default field values for the current context, in the active currency.
  const dPrice = display(v.base + CONFIG.fees);
  const dDown = display(resolveDown(v, downMode.value, customDown.value, isLease, CONFIG));
  const dApr = isLease ? CONFIG.lease.apr : CONFIG.finance.apr;
  const dTerm = isLease ? CONFIG.lease.termMonths : CONFIG.finance.termMonths;
  const dResid = display(Math.round((v.base * v.residualPct) / 100));

  // Reset the editable fields when the context changes (set-state-during-render).
  const nextSig = `${key}|${mode}|${activeCurrency.value.code}|${tax}|${downMode.value}|${customDown.value}`;
  if (nextSig !== sig) {
    setSig(nextSig);
    setPrice(dPrice);
    setDown(dDown);
    setApr(dApr);
    setTerm(dTerm);
    setResid(dResid);
  }

  const priceBase = toBaseValue(price);
  const downBase = toBaseValue(down);

  let out: string;
  let brk: string;
  let eq: string;
  if (!isLease) {
    const r = financeMonthly(priceBase, downBase, 0, apr, term, 0);
    const rt = financeMonthly(priceBase, downBase, 0, apr, term, tax);
    out = money(rt.monthly);
    brk = `${money(rt.monthly)}/mo incl tax · ${money(r.monthly)} pre-tax · financed ${money(rt.principal)} · ${apr}% · ${term} mo`;
    eq =
      `P = price+fees+tax − down = ${money(rt.principal)}\n` +
      `i = APR/12 = ${(apr / 12).toFixed(4)}%/mo\n` +
      `M = P·i / (1 − (1+i)^−n) = ${money(rt.monthly)}`;
  } else {
    const residBase = toBaseValue(resid);
    const r = leaseMonthly(priceBase, downBase, 0, residBase, apr, term, 0);
    const rt = leaseMonthly(priceBase, downBase, 0, residBase, apr, term, tax);
    out = money(rt.monthly);
    brk = `${money(rt.monthly)}/mo incl tax · ${money(r.monthlyPreTax)} pre-tax · adjCap ${money(r.adjustedCap)} · residual ${money(residBase)}`;
    eq =
      `adjCap = price+fees − down = ${money(r.adjustedCap)}\n` +
      `MF = APR/2400 = ${r.moneyFactor.toFixed(6)}\n` +
      `dep  = (adjCap − residual)/n = ${money(r.depreciation)}\n` +
      `rent = (adjCap + residual)·MF = ${money(r.rent)}\n` +
      `M = (dep+rent) × (1+tax) = ${money(rt.monthly)}`;
  }

  return (
    <div class="grid2 reveal">
      <div class="card pad">
        <div class="controls">
          <div class="ctrl">
            <label>Vehicle</label>
            <select value={key} onChange={(e) => setKey((e.currentTarget as HTMLSelectElement).value)}>
              {VEHICLES.map((x) => (
                <option value={x.key}>{x.name}</option>
              ))}
            </select>
          </div>
          <div class="ctrl">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode((e.currentTarget as HTMLSelectElement).value as Mode)}>
              <option value="finance">Finance</option>
              <option value="lease">Lease</option>
            </select>
          </div>
        </div>
        <div class="controls" style={{ marginTop: '14px' }}>
          <div class="ctrl">
            <label>Price+fees</label>
            <input type="number" step="100" style={{ width: '108px' }} value={price} onInput={(e) => setPrice(num(e))} />
          </div>
          <div class="ctrl">
            <label>Down</label>
            <input type="number" step="100" style={{ width: '88px' }} value={down} onInput={(e) => setDown(num(e))} />
          </div>
          <div class="ctrl">
            <label>APR %</label>
            <input type="number" step="0.01" style={{ width: '76px' }} value={apr} onInput={(e) => setApr(num(e))} />
          </div>
          <div class="ctrl">
            <label>Term mo</label>
            <input type="number" step="12" style={{ width: '66px' }} value={term} onInput={(e) => setTerm(num(e))} />
          </div>
          {isLease && (
            <div class="ctrl">
              <label>Residual</label>
              <input type="number" step="100" style={{ width: '98px' }} value={resid} onInput={(e) => setResid(num(e))} />
            </div>
          )}
        </div>
      </div>

      <div class="card pad">
        <div class="wout">
          <span class="num">{out}</span> <small>/mo</small>
        </div>
        <div
          class="ssub"
          style={{ paddingLeft: 0, color: 'var(--ink)', margin: '8px 0 0' }}
          dangerouslySetInnerHTML={{ __html: brk }}
        />
        <div class="eqbox">{eq}</div>
      </div>
    </div>
  );
}

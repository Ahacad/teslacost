import { S } from '../state';
import { WORLDS, MY_PRETAX, MY_DOWN5, TAX_RATE } from '../data/worlds';
import { pmt } from '../domain/amort';
import {
  prin, termOf, insRaw, energyMonthly, subMonthly, monthlyAllIn, negEquity, delayOf, upfrontOf, tradeCredit,
} from '../domain/finance';
import { fmt } from './format';

/** Live itemized monthly for the configured car (my099): stacked bar + line items + the P derivation. */
export function renderBreakdown(): void {
  const el = document.getElementById('myBreakdown');
  if (!el) return;
  const w = WORLDS.find((x) => x.key === 'my099')!;
  const kia = WORLDS[0];
  const D = delayOf(w);
  const P = prin(w);
  const pay = pmt(P, w.apr, termOf(w));
  const parts = [
    { k: 'Loan payment', v: pay, c: 'var(--cat-pay)', note: `${fmt(P)} @ ${w.apr}% / ${termOf(w)} mo` },
    { k: 'Insurance', v: insRaw(w), c: 'var(--cat-ins)', note: 'your real quote (Progressive ÷ 6; GEICO wanted $500)' },
    { k: 'Maintenance', v: w.maint, c: 'var(--cat-maint)', note: 'tires/wipers/misc, flat' },
    { k: 'Charging', v: energyMonthly(w), c: 'var(--cat-fuel)', note: `$${S.ev} case × ${(S.miles / 23400).toFixed(2)} miles level` },
    { k: 'FSD', v: subMonthly(w), c: 'var(--cat-fsd)', note: S.fsd ? '$99 + WA tax, cancelable monthly' : 'toggled off' },
  ];
  const total = monthlyAllIn(w);
  const kiaTotal = monthlyAllIn(kia);
  const d = total - kiaTotal;

  const bar = parts
    .filter((p) => p.v > 0)
    .map((p) => `<div style="width:${(100 * p.v) / total}%;background:${p.c}" title="${p.k} ${fmt(p.v)}"></div>`)
    .join('');
  const rows = parts
    .map(
      (p) => `<div class="bk-row${p.v === 0 ? ' off' : ''}">
        <span><span class="dot" style="background:${p.c}"></span>${p.k}<small> — ${p.note}</small></span>
        <b>${p.v === 0 ? '$0' : fmt(p.v)}</b></div>`,
    )
    .join('');

  // How the financed amount is built (mirrors prin() for the promo tier: the
  // 0.99% band caps the loan at 95% of the pre-tax price; tax + gap are cash).
  const roll = negEquity(D);
  const derivation =
    `P = 95% × ${fmt(MY_PRETAX)} pre-tax = <b>${fmt(P)}</b> financed <small>(0.99% band caps the loan at ≤100% LTV)</small><br>` +
    `cash gate = 5% down ${fmt(MY_DOWN5)} + WA tax after trade credit ${fmt(MY_PRETAX * TAX_RATE - tradeCredit(D))} + rack + ` +
    `${roll >= 0 ? `Kia gap ${fmt(roll)}` : `<span class="pos">Kia equity ${fmt(-roll)}</span>`}${D > 0 ? `<small> (at trade month ${D})</small>` : ''}` +
    ` = <b>${fmt(upfrontOf(w))}</b> at signing`;

  el.innerHTML =
    `<div class="bk-bar">${bar}</div>` +
    rows +
    `<div class="bk-row total"><span>All-in monthly</span><b>${fmt(total)}/mo</b></div>` +
    `<div class="bk-foot">${derivation}<br>` +
    `Keeping the Kia runs ${fmt(kiaTotal)}/mo all-in → this build runs <b style="color:${d <= 0 ? 'var(--good)' : 'var(--accent)'}">` +
    `${d <= 0 ? fmt(-d) + '/mo less' : fmt(d) + '/mo more'}</b>. ` +
    `<small>Cash today ${fmt(upfrontOf(w))} and monthly costs are only half the story — the table below nets out resale.</small></div>`;
}

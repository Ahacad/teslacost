import { S, ui } from '../state';
import { WORLDS, MY_PRETAX, MY_DOWN5, TAX_RATE } from '../data/worlds';
import { pmt } from '../domain/amort';
import {
  prin, termOf, insRaw, energyMonthly, subMonthly, monthlyAllIn, negEquity, delayOf, upfrontOf, tradeCredit, aprOf,
} from '../domain/finance';
import { fmt } from './format';

/** The MY financing row the monthly-bar cards display (shared with compare.ts). */
export function barWorld() {
  return WORLDS.find((x) => x.key === ui.barTier) ?? WORLDS.find((x) => x.key === 'my099')!;
}

/** Live itemized monthly for the selected MY tier: stacked bar + line items + the P derivation. */
export function renderBreakdown(): void {
  const el = document.getElementById('myBreakdown');
  if (!el) return;
  const w = barWorld();
  const kia = WORLDS[0];
  const D = delayOf(w);
  const P = prin(w);
  const apr = aprOf(w);
  const pay = pmt(P, apr, termOf(w));
  const payNote =
    w.tier === 'promo'
      ? `${fmt(P)} @ ${apr}% / ${termOf(w)} mo — FIXED by the 0.99% band (loan = 95% of price; the sliders move the cash gate below, not this payment)`
      : `${fmt(P)} @ ${apr}% / ${termOf(w)} mo — moves with the trade-in offer, trade month${w.tier === 'roll' ? ', and your cash down' : ''}`;
  const parts = [
    { k: 'Loan payment', v: pay, c: 'var(--cat-pay)', note: payNote },
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

  // How the financed amount is built — mirrors prin()/upfrontOf() per tier, so the
  // reader sees exactly which sliders feed the payment vs the cash at signing.
  const roll = negEquity(D);
  const gapTxt = roll >= 0 ? `Kia gap ${fmt(roll)}` : `<span class="pos">Kia equity ${fmt(-roll)}</span>`;
  const atD = D > 0 ? `<small> (at trade month ${D})</small>` : '';
  const derivation =
    w.tier === 'promo'
      ? `P = 95% × ${fmt(MY_PRETAX)} pre-tax = <b>${fmt(P)}</b> financed <small>(0.99% band caps the loan at ≤100% LTV)</small><br>` +
        `cash gate = 5% down ${fmt(MY_DOWN5)} + WA tax after trade credit ${fmt(MY_PRETAX * TAX_RATE - tradeCredit(D))} + rack + ${gapTxt}${atD}` +
        ` = <b>${fmt(upfrontOf(w))}</b> at signing`
      : w.tier === 'roll'
        ? `P = ${fmt(w.otd!)} OTD − trade credit ${fmt(tradeCredit(D))} + ${gapTxt}${atD} − down ${fmt(S.myDown)} = <b>${fmt(P)}</b> financed <small>(>100% LTV, bank approval)</small><br>` +
          `cash = down + rack = <b>${fmt(upfrontOf(w))}</b> at signing`
        : `P = ${fmt(w.otd!)} OTD − trade credit ${fmt(tradeCredit(D))} + ${gapTxt}${atD} = <b>${fmt(P)}</b> financed <small>(standard rate, no down)</small><br>` +
          `cash = rack = <b>${fmt(upfrontOf(w))}</b> at signing`;

  el.innerHTML =
    `<div class="bk-bar">${bar}</div>` +
    rows +
    `<div class="bk-row total"><span>All-in monthly</span><b>${fmt(total)}/mo</b></div>` +
    `<div class="bk-foot">${derivation}<br>` +
    `Keeping the Kia runs ${fmt(kiaTotal)}/mo all-in → this build runs <b style="color:${d <= 0 ? 'var(--good)' : 'var(--accent)'}">` +
    `${d <= 0 ? fmt(-d) + '/mo less' : fmt(d) + '/mo more'}</b>. ` +
    `<small>Cash today ${fmt(upfrontOf(w))} and monthly costs are only half the story — the table below nets out resale.</small></div>`;
}

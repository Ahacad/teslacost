import { S } from '../state';
import { WORLDS, TRADE_CREDIT, ROLL_BASE } from '../data/worlds';
import { pmt } from '../domain/amort';
import {
  prin, termOf, insRaw, energyMonthly, subMonthly, monthlyAllIn, negEquity, delayOf,
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
    { k: 'Loan payment', v: pay, c: 'var(--my099)', note: `${fmt(P)} @ ${w.apr}% / ${termOf(w)} mo` },
    { k: 'Insurance', v: insRaw(w), c: 'var(--usedmy6)', note: 'your real quote (Progressive ÷ 6; GEICO wanted $500)' },
    { k: 'Maintenance', v: w.maint, c: 'var(--phev)', note: 'tires/wipers/misc, flat' },
    { k: 'Charging', v: energyMonthly(w), c: 'var(--ioniq)', note: `$${S.ev} case × ${(S.miles / 23400).toFixed(2)} miles level` },
    { k: 'FSD', v: subMonthly(w), c: 'var(--lease)', note: S.fsd ? '$99 + WA tax, cancelable monthly' : 'toggled off' },
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

  // How the financed amount is built (mirrors prin(); ROLL_BASE is baked into w.principal).
  const base = w.principal - ROLL_BASE; // = OTD − down
  const roll = negEquity(D);
  const derivation =
    `P = ${fmt(base)} <small>(your build ${fmt(w.otd ?? 0)} OTD − ${fmt(w.down ?? 0)} down)</small>` +
    ` + rolled Kia gap ${fmt(roll)}${D > 0 ? `<small> (at trade month ${D})</small>` : ''}` +
    (S.tradeCredit ? ` − trade-in tax credit ${fmt(TRADE_CREDIT)}` : '') +
    ` = <b>${fmt(P)}</b> financed`;

  el.innerHTML =
    `<div class="bk-bar">${bar}</div>` +
    rows +
    `<div class="bk-row total"><span>All-in monthly</span><b>${fmt(total)}/mo</b></div>` +
    `<div class="bk-foot">${derivation}<br>` +
    `Keeping the Kia runs ${fmt(kiaTotal)}/mo all-in → this build runs <b style="color:${d <= 0 ? 'var(--good)' : 'var(--accent)'}">` +
    `${d <= 0 ? fmt(-d) + '/mo less' : fmt(d) + '/mo more'}</b>. ` +
    `<small>Cash today (down + roof rack) ${fmt(w.upfront)} and monthly costs are only half the story — the table below nets out resale.</small></div>`;
}

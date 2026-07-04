import { S } from '../state';
import { WORLDS, LEASE_PMT } from '../data/worlds';
import { pmt } from '../domain/amort';
import {
  prin, termOf, value, beatsKia, walkAway, monthlyAllIn, gasMonthly, insRaw, energyMonthly, subMonthly, negEquity,
} from '../domain/finance';
import { fmt } from './format';
import { drawChart } from './chart';
import { updateWorked } from './worked';
import { renderBreakdown } from './breakdown';

/** First month (0..36) the Kia is no longer underwater on a dealer trade, or null within 3 years. */
function equityCrossover(): number | null {
  for (let m = 0; m <= 36; m++) if (negEquity(m) <= 0) return m;
  return null;
}

function renderDelayReadout(): void {
  const el = document.getElementById('delayReadout');
  if (!el) return;
  const now = negEquity(0);
  const atD = negEquity(S.delay);
  const cross = equityCrossover();
  const tag = (v: number) => (v > 0 ? `${fmt(v)} underwater` : `${fmt(-v)} positive equity`);
  const crossTxt =
    cross === null ? 'still underwater at 36 mo' : cross === 0 ? 'already above water' : `breaks even at month ${cross}`;
  el.innerHTML =
    `Trade now: <b>${tag(now)}</b>` +
    (S.delay > 0 ? ` · after ${S.delay} mo: <b>${tag(atD)}</b>` : '') +
    ` · ${crossTxt}. The rolled gap is financed into the new car (or paid down by waiting).`;
}

// ---- table + pills + verdict ----
export function render(): void {
  drawChart();
  const k = WORLDS[0];
  const hold = S.hold;
  const rows = WORLDS.map((w) => ({ w, val: value(w, hold), be: beatsKia(w), wa: walkAway(w), mo: monthlyAllIn(w) }));
  const ranked = [...rows].sort((a, b) => a.val - b.val);
  const cheapestReal = ranked.filter((r) => r.w.owns && r.w.key !== 'kia')[0];
  const kiaVal = value(k, hold);
  const save = kiaVal - cheapestReal.val;
  const when = S.delay > 0 ? ` (after keeping the Kia ${S.delay} more months)` : '';
  document.getElementById('verdict')!.innerHTML =
    `At <b>${hold} months</b>, the cheapest world you'd actually own is <b>${cheapestReal.w.label}</b>${when} at ` +
    `<b>${fmt(cheapestReal.val)}</b> — that's <b>${save >= 0 ? fmt(save) + ' less' : fmt(-save) + ' more'}</b> than keeping the Kia ` +
    `(${fmt(kiaVal)}). ${save >= 0 ? 'Switching saves money' : 'Keeping the Kia is cheaper'} on this horizon and these charging assumptions.`;
  renderDelayReadout();
  const pills: [string, string, string][] = [
    ['Cheapest (owned)', cheapestReal.w.short, fmt(cheapestReal.val)],
    ['vs keep Kia', save >= 0 ? 'saves' : 'costs', (save >= 0 ? '' : '+') + fmt(Math.abs(save))],
    ['Kia gas now', 'per month', fmt(gasMonthly(k))],
    ['Kia, kept', 'net @' + hold + 'mo', fmt(kiaVal)],
  ];
  document.getElementById('pills')!.innerHTML = pills
    .map((p) => `<div class="pill"><div class="k">${p[0]}</div><div class="v">${p[2]} <small>${p[1]}</small></div></div>`)
    .join('');
  const isp = document.getElementById('insSpread');
  if (isp)
    isp.textContent = `Ioniq $${Math.round(insRaw(WORLDS[1]))} · used MY $${Math.round(insRaw(WORLDS[3]))} · PHEV $${Math.round(insRaw(WORLDS[5]))} · lease $${Math.round(insRaw(WORLDS[7]))}/mo`;
  document.getElementById('hcol')!.textContent = 'Cost @ ' + hold + 'mo';
  document.getElementById('hold2')!.textContent = String(hold);
  const tb = document.querySelector('#tbl tbody')!;
  tb.innerHTML = '';
  for (const r of ranked) {
    const w = r.w;
    const d = r.val - kiaVal;
    const tr = document.createElement('tr');
    if (w.key === cheapestReal.w.key) tr.className = 'win';
    else if (w.key === 'kia') tr.className = 'kia';
    else if (w.key === 'my099') tr.className = 'my099';
    const tags = (w.tag ? `<span class="tag">${w.tag}</span>` : '') + (w.tagBad ? `<span class="tag bad">${w.tagBad}</span>` : '');
    tr.innerHTML =
      `<td><span class="dot" style="background:${w.color}"></span>${w.label}${tags}</td>` +
      `<td>${fmt(w.upfront)}</td><td>${fmt(r.mo)}</td><td>${fmt(r.val)}</td>` +
      `<td class="${w.key === 'kia' ? '' : d < 0 ? 'pos' : 'neg'}">${w.key === 'kia' ? '—' : d < 0 ? fmt(d) : '+' + fmt(d)}</td>` +
      `<td>${r.be ? 'mo ' + r.be : '—'}</td>` +
      `<td>${w.owns ? (r.wa ? 'mo ' + r.wa : '>96') : '<span class="neg">never</span>'}</td>` +
      `<td>${w.owns ? 'yes' : '<span class="neg">no</span>'}</td>`;
    tb.appendChild(tr);
  }
  document.getElementById('cards')!.innerHTML = WORLDS.map((w) => {
    const p = w.type === 'lease' ? LEASE_PMT : pmt(prin(w), w.apr, termOf(w));
    const breakdown =
      w.type === 'lease'
        ? `lease $${LEASE_PMT} + insurance $${Math.round(insRaw(w))} + energy ${fmt(energyMonthly(w))} = <b>${fmt(monthlyAllIn(w))}/mo</b>, $0 equity`
        : `payment ${fmt(p)} + insurance $${Math.round(insRaw(w))} + maint $${w.maint}` +
          `${gasMonthly(w) > 0 ? ` + ${w.type === 'phev' ? 'energy' : 'gas'} ${fmt(gasMonthly(w))}` : ''}` +
          `${energyMonthly(w) > 0 ? ` + energy ${fmt(energyMonthly(w))}` : ''}${subMonthly(w) > 0 ? ` + FSD $${subMonthly(w)}` : ''} = <b>${fmt(monthlyAllIn(w))}/mo</b>`;
    return `<details ${w.key === 'ioniq' || w.key === 'my099' ? 'open' : ''}>
      <summary><span class="dot" style="background:${w.color}"></span>${w.label} — ${fmt(monthlyAllIn(w))}/mo all-in</summary>
      <div class="body">${breakdown}.<br>${w.note}</div></details>`;
  }).join('');
  renderBreakdown();
  updateWorked();
}

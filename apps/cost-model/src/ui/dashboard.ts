import { S } from '../state';
import { WORLDS, LEASE_PMT } from '../data/worlds';
import { pmt } from '../domain/amort';
import {
  prin, termOf, value, beatsKia, walkAway, monthlyAllIn, gasMonthly, insRaw, energyMonthly,
} from '../domain/finance';
import { fmt } from './format';
import { drawChart } from './chart';
import { updateWorked } from './worked';

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
  document.getElementById('verdict')!.innerHTML =
    `At <b>${hold} months</b>, the cheapest world you'd actually own is <b>${cheapestReal.w.label}</b> at ` +
    `<b>${fmt(cheapestReal.val)}</b> — that's <b>${save >= 0 ? fmt(save) + ' less' : fmt(-save) + ' more'}</b> than keeping the Kia ` +
    `(${fmt(kiaVal)}). ${save >= 0 ? 'Switching saves money' : 'Keeping the Kia is cheaper'} on this horizon and these charging assumptions.`;
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
    isp.textContent = `Kia $${Math.round(insRaw(WORLDS[0]))} · Model Y $${Math.round(insRaw(WORLDS[2]))} · Ioniq $${Math.round(insRaw(WORLDS[1]))} · PHEV $${Math.round(insRaw(WORLDS[5]))}/mo`;
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
        ? `lease $${LEASE_PMT} + insurance $${Math.round(insRaw(w))} + energy $${S.ev} = <b>${fmt(monthlyAllIn(w))}/mo</b>, $0 equity`
        : `payment ${fmt(p)} + insurance $${Math.round(insRaw(w))} + maint $${w.maint}` +
          `${gasMonthly(w) > 0 ? ` + ${w.type === 'phev' ? 'energy' : 'gas'} ${fmt(gasMonthly(w))}` : ''}` +
          `${energyMonthly(w) > 0 ? ` + energy $${S.ev}` : ''} = <b>${fmt(monthlyAllIn(w))}/mo</b>`;
    return `<details ${w.key === 'ioniq' || w.key === 'my099' ? 'open' : ''}>
      <summary><span class="dot" style="background:${w.color}"></span>${w.label} — ${fmt(monthlyAllIn(w))}/mo all-in</summary>
      <div class="body">${breakdown}.<br>${w.note}</div></details>`;
  }).join('');
  updateWorked();
}

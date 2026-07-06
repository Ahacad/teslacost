import { S } from '../state';
import { WORLDS } from '../data/worlds';
import { pmt } from '../domain/amort';
import { prin, termOf, insRaw, energyMonthly, gasMonthly, subMonthly, monthlyAllIn } from '../domain/finance';
import { fmt, getCSS } from './format';

// Geometry (viewBox units). Two horizontal bars on ONE shared $/px scale so bar
// length is proportional to total monthly cost; dotted connectors link the same
// category across the two bars.
const CW = 920;
const CH = 244;
const xL = 140; // left gutter (car name + total)
const barW = 720; // max bar length in px
const myY = 54;
const kiaY = 166;
const barH = 40;
const bandTop = myY + barH; // 94 — bottom edge of the MY bar
const bandBot = kiaY; //        166 — top edge of the Kia bar
const gridTop = 44;
const gridBot = 214;

interface Cat {
  key: 'pay' | 'ins' | 'maint' | 'fuel' | 'fsd';
  label: string;
  cvar: string;
  my: number;
  kia: number;
}

/** Model Y vs the Kia Sportage: same monthly categories, two parallel bars, category connectors. */
export function renderCompare(): void {
  const el = document.getElementById('myVsKia');
  if (!el) return;
  const my = WORLDS.find((w) => w.key === 'my099')!;
  const kia = WORLDS[0];

  // Each category's live monthly dollars for both cars. Fuel/energy = gas for the
  // Kia, charging for the MY. Sums equal monthlyAllIn() for each car by construction.
  const cats: Cat[] = [
    { key: 'pay', label: 'Payment', cvar: '--cat-pay', my: pmt(prin(my), my.apr, termOf(my)), kia: pmt(S.kiaOwed, S.kiaApr, S.kiaMonths) },
    { key: 'ins', label: 'Insurance', cvar: '--cat-ins', my: insRaw(my), kia: insRaw(kia) },
    { key: 'maint', label: 'Maintenance', cvar: '--cat-maint', my: my.maint, kia: kia.maint },
    { key: 'fuel', label: 'Fuel / energy', cvar: '--cat-fuel', my: energyMonthly(my), kia: gasMonthly(kia) },
    { key: 'fsd', label: 'FSD', cvar: '--cat-fsd', my: subMonthly(my), kia: 0 },
  ];
  const col: Record<string, string> = {};
  for (const c of cats) col[c.key] = getCSS(c.cvar);

  const myTotal = monthlyAllIn(my);
  const kiaTotal = monthlyAllIn(kia);
  const maxTotal = Math.max(myTotal, kiaTotal);
  const gridMax = Math.ceil(maxTotal / 500) * 500; // round scale up to a clean $500 tick
  const scale = barW / gridMax;
  const surf = getCSS('--card');
  const line = getCSS('--line');
  const muted = getCSS('--muted');

  // --- gridlines (shared $ scale, both bars read against these) ---
  let g = `<g font-size="10" fill="${muted}">`;
  for (let v = 0; v <= gridMax; v += 500) {
    const x = xL + v * scale;
    g += `<line x1="${x.toFixed(1)}" y1="${gridTop}" x2="${x.toFixed(1)}" y2="${gridBot}" stroke="${line}" stroke-dasharray="2 3"/>`;
    const lab = v === 0 ? '$0' : `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k`;
    g += `<text x="${x.toFixed(1)}" y="${gridBot + 14}" text-anchor="middle">${lab}</text>`;
  }
  g += `</g>`;

  // --- one bar: stacked segments, 2px surface gap, $ inside wide segments ---
  const bar = (valOf: (c: Cat) => number, y: number): string => {
    let cum = 0;
    let s = '';
    for (const c of cats) {
      const v = valOf(c);
      if (v <= 0) continue;
      const x0 = xL + cum * scale;
      const wRaw = v * scale;
      const w = Math.max(1, wRaw - 2);
      s += `<rect x="${(x0 + 1).toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${barH}" rx="3" fill="${col[c.key]}"><title>${c.label}: ${fmt(v)}/mo</title></rect>`;
      const inside = wRaw >= 92 ? `${c.label}  ${fmt(v)}` : wRaw >= 40 ? fmt(v) : '';
      if (inside) s += `<text x="${(x0 + wRaw / 2).toFixed(1)}" y="${(y + barH / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">${inside}</text>`;
      cum += v;
    }
    return s;
  };

  // --- category connectors: dot on each bar's segment center, dotted line between ---
  const dot = (x: number, yy: number, c: string): string =>
    `<circle cx="${x.toFixed(1)}" cy="${yy}" r="4.5" fill="${c}" stroke="${surf}" stroke-width="1.6"/>`;
  let conn = '';
  let cm = 0;
  let ck = 0;
  for (const c of cats) {
    const mx = xL + (cm + c.my / 2) * scale;
    const kx = xL + (ck + c.kia / 2) * scale;
    if (c.my > 0 && c.kia > 0) {
      conn += `<line x1="${mx.toFixed(1)}" y1="${bandTop}" x2="${kx.toFixed(1)}" y2="${bandBot}" stroke="${col[c.key]}" stroke-width="1.6" stroke-dasharray="1 4" stroke-linecap="round" opacity="0.85"/>`;
      conn += dot(mx, bandTop, col[c.key]) + dot(kx, bandBot, col[c.key]);
    } else if (c.my > 0) {
      // MY-only category (FSD): stub down from the MY bar, no Kia counterpart.
      conn += `<line x1="${mx.toFixed(1)}" y1="${bandTop}" x2="${mx.toFixed(1)}" y2="${(bandTop + 20).toFixed(1)}" stroke="${col[c.key]}" stroke-width="1.4" stroke-dasharray="1 4" stroke-linecap="round" opacity="0.6"/>`;
      conn += dot(mx, bandTop, col[c.key]);
      conn += `<text x="${mx.toFixed(1)}" y="${(bandTop + 33).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${muted}">MY only</text>`;
    }
    cm += c.my;
    ck += c.kia;
  }

  // --- left gutter labels + the bars themselves ---
  const gutter =
    `<text x="8" y="${myY + barH / 2 - 3}" font-size="13" font-weight="700" fill="${col.pay}">Model Y</text>` +
    `<text x="8" y="${myY + barH / 2 + 13}" font-size="11.5" fill="${muted}">${fmt(myTotal)}/mo</text>` +
    `<text x="8" y="${kiaY + barH / 2 - 3}" font-size="13" font-weight="700" fill="${getCSS('--kia')}">Kia Sportage</text>` +
    `<text x="8" y="${kiaY + barH / 2 + 13}" font-size="11.5" fill="${muted}">${fmt(kiaTotal)}/mo</text>`;

  const svg =
    `<svg viewBox="0 0 ${CW} ${CH}" role="img" aria-label="Model Y vs Kia Sportage monthly cost breakdown">` +
    g +
    gutter +
    bar((c) => c.my, myY) +
    bar((c) => c.kia, kiaY) +
    conn +
    `</svg>`;

  // --- precise per-category table (also the color legend) ---
  const rows = cats
    .map((c) => {
      const d = c.my - c.kia;
      const dCls = d > 0 ? 'neg' : d < 0 ? 'pos' : '';
      const dTxt = d === 0 ? '—' : (d > 0 ? '+' : '') + fmt(d);
      return `<tr><td><span class="dot" style="background:${c.cvar.startsWith('--') ? `var(${c.cvar})` : c.cvar}"></span>${c.label}</td>` +
        `<td>${fmt(c.my)}</td><td>${fmt(c.kia)}</td><td class="${dCls}">${dTxt}</td></tr>`;
    })
    .join('');
  const dTot = myTotal - kiaTotal;
  const totRow =
    `<tr class="cmp-tot"><td>All-in monthly</td><td>${fmt(myTotal)}</td><td>${fmt(kiaTotal)}</td>` +
    `<td class="${dTot > 0 ? 'neg' : 'pos'}">${(dTot > 0 ? '+' : '') + fmt(dTot)}</td></tr>`;

  // takeaway: total gap + the two biggest category swings
  const swings = [...cats].sort((a, b) => Math.abs(b.my - b.kia) - Math.abs(a.my - a.kia));
  const phrase = (c: Cat): string => {
    const d = c.my - c.kia;
    return `${c.label.toLowerCase()} ${d < 0 ? fmt(-d) + '/mo cheaper' : fmt(d) + '/mo pricier'}`;
  };
  const foot =
    `On the same scale, the Model Y's all-in monthly is <b>${fmt(Math.abs(dTot))}/mo ${dTot <= 0 ? 'lower' : 'higher'}</b> than the Kia Sportage right now. ` +
    `Biggest swings: ${phrase(swings[0])}, then ${phrase(swings[1])}. ` +
    `<small>Monthly only — it ignores the Model Y's ${fmt(my.upfront)} upfront and the resale/equity that the table below nets out over your holding period.</small>`;

  el.innerHTML =
    svg +
    `<table class="cmp-tbl"><thead><tr><th>Category</th><th>Model Y</th><th>Kia Sportage</th><th>Δ (MY−Kia)</th></tr></thead>` +
    `<tbody>${rows}${totRow}</tbody></table>` +
    `<div class="bk-foot">${foot}</div>`;
}

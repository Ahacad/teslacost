import { S, hidden, FEAT, ui } from '../state';
import { WORLDS } from '../data/worlds';
import { value } from '../domain/finance';
import { getCSS, fmtk, fmt } from './format';
import { render } from './dashboard';

const PAD = { l: 58, r: 96, t: 14, b: 34 };
const CW = 920;
const CH = 430;
const PW = CW - PAD.l - PAD.r;
const PH = CH - PAD.t - PAD.b;

export function px(m: number): number {
  return PAD.l + (m / 96) * PW;
}
export function py(v: number, max: number): number {
  return PAD.t + (1 - v / max) * PH;
}

export function drawChart(): void {
  ui.VIS = WORLDS.filter((w) => !hidden.has(w.key));
  // y-axis is locked to ALL worlds (not just visible) so hiding lines never re-slopes the survivors.
  let ymax = 0;
  for (const w of WORLDS) for (let m = 0; m <= 96; m++) ymax = Math.max(ymax, value(w, m));
  ymax = Math.max(10000, Math.ceil(ymax / 10000) * 10000);
  ui.CHARTMAX = ymax;
  let s = `<g font-size="11" fill="${getCSS('--muted')}">`;
  for (let v = 0; v <= ymax; v += 10000) {
    const y = py(v, ymax);
    s += `<line x1="${PAD.l}" y1="${y}" x2="${CW - PAD.r}" y2="${y}" stroke="${getCSS('--line')}"/>`;
    s += `<text x="${PAD.l - 7}" y="${y + 3}" text-anchor="end">$${v / 1000}k</text>`;
  }
  for (const m of [0, 12, 24, 36, 48, 60, 72, 84, 96]) {
    const x = px(m);
    s += `<line x1="${x}" y1="${PAD.t}" x2="${x}" y2="${PAD.t + PH}" stroke="${getCSS('--line')}" stroke-dasharray="2 3"/>`;
    s += `<text x="${x}" y="${PAD.t + PH + 18}" text-anchor="middle">${m}</text>`;
  }
  s += `<text x="${PAD.l + PW / 2}" y="${CH - 2}" text-anchor="middle">months</text>`;
  const mx = px(S.hold);
  s += `<line x1="${mx}" y1="${PAD.t}" x2="${mx}" y2="${PAD.t + PH}" stroke="${getCSS('--accent')}" stroke-width="1.4" opacity=".5"/>`;
  s += `<text x="${mx}" y="${PAD.t - 3}" text-anchor="middle" fill="${getCSS('--accent')}" font-size="10.5">hold ${S.hold}mo</text>`;
  s += `</g>`;
  // lines
  for (const w of ui.VIS) {
    let d = '';
    for (let m = 0; m <= 96; m++) d += (m ? 'L' : 'M') + px(m).toFixed(1) + ' ' + py(value(w, m), ymax).toFixed(1) + ' ';
    const dash = w.key === 'lease' || w.key === 'my627' ? 'stroke-dasharray="6 4"' : '';
    const feat = FEAT.has(w.key);
    // Kia + MY 0.99% are always lit; every other line is faded but floats up to lit while it's the hovered/nearest one.
    const lit = feat || ui.hi === w.key;
    const wdt = ui.hi === w.key ? 3.5 : feat ? 3.3 : 1.7;
    const op = lit ? (w.key === 'lease' ? 0.85 : 1) : 0.3;
    s += `<path d="${d}" fill="none" stroke="${w.color}" stroke-width="${wdt}" ${dash} opacity="${op}"/>`;
  }
  // end-of-line labels (de-overlapped)
  const labs = ui.VIS.map((w) => ({ w, y: py(value(w, 96), ymax), ey: py(value(w, 96), ymax) })).sort((a, b) => a.y - b.y);
  let prev = -99;
  for (const L of labs) {
    if (L.y < prev + 12) L.y = prev + 12;
    prev = L.y;
  }
  const over = (labs.length ? labs[labs.length - 1].y : 0) - (PAD.t + PH);
  if (over > 0) for (const L of labs) L.y -= over;
  for (const L of labs) {
    const dim = !(FEAT.has(L.w.key) || ui.hi === L.w.key);
    if (Math.abs(L.y - L.ey) > 5)
      s += `<line x1="${px(96) + 1}" y1="${L.ey}" x2="${px(96) + 5}" y2="${L.y + 0.5}" stroke="${L.w.color}" stroke-width="0.8" opacity="${dim ? 0.3 : 0.6}"/>`;
    s += `<text x="${px(96) + 6}" y="${L.y + 3.5}" font-size="10.5" font-weight="600" fill="${L.w.color}" opacity="${dim ? 0.3 : 1}">${L.w.short} ${fmtk(value(L.w, 96))}</text>`;
  }
  s += `<g id="hoverlayer"></g>`;
  document.getElementById('chart')!.innerHTML = s;
  // legend (clickable)
  document.getElementById('legend')!.innerHTML = WORLDS.map(
    (w) =>
      `<span data-k="${w.key}" class="${hidden.has(w.key) ? 'off' : ''} ${FEAT.has(w.key) ? 'feat' : ''}"><i class="swatch" style="background:${w.color}"></i>${w.label}</span>`,
  ).join('');
  document.querySelectorAll<HTMLElement>('#legend span').forEach((el) => {
    el.onclick = () => {
      const k = el.dataset.k!;
      if (hidden.has(k)) hidden.delete(k);
      else hidden.add(k);
      if (hidden.size >= WORLDS.length) hidden.delete(k);
      render();
    };
    el.onmouseenter = () => {
      ui.hi = el.dataset.k!;
      drawChart();
    };
    el.onmouseleave = () => {
      ui.hi = null;
      drawChart();
    };
  });
}

// ---- hover tooltip ----
export function onMove(ev: MouseEvent): void {
  const svg = document.getElementById('chart')!;
  const rect = svg.getBoundingClientRect();
  const scale = CW / rect.width;
  const vbx = (ev.clientX - rect.left) * scale;
  const m = Math.max(0, Math.min(96, Math.round(((vbx - PAD.l) / PW) * 96)));
  const tip = document.getElementById('tip')!;
  // only hide when truly left of the y-axis; the right label gutter still reads as month 96.
  if (vbx < PAD.l - 14) {
    tip.style.opacity = '0';
    document.getElementById('hoverlayer')!.innerHTML = '';
    if (ui.hi) {
      ui.hi = null;
      drawChart();
    }
    return;
  }
  // float the line nearest the cursor (Kia + MY 0.99% stay lit regardless); redraw only when the nearest line changes
  const scaleY = CH / rect.height;
  const vby = (ev.clientY - rect.top) * scaleY;
  let near: string | null = null;
  let bd = 1e9;
  for (const w of ui.VIS) {
    const dy = Math.abs(py(value(w, m), ui.CHARTMAX) - vby);
    if (dy < bd) {
      bd = dy;
      near = w.key;
    }
  }
  if (near !== ui.hi) {
    ui.hi = near;
    drawChart();
  }
  const mx = px(m);
  // hover guideline + dots
  let g = `<line x1="${mx}" y1="${PAD.t}" x2="${mx}" y2="${PAD.t + PH}" stroke="${getCSS('--ink')}" stroke-width="1" opacity=".35"/>`;
  const rows = ui.VIS.map((w) => ({ w, v: value(w, m) })).sort((a, b) => a.v - b.v);
  for (const r of rows) g += `<circle cx="${mx}" cy="${py(r.v, ui.CHARTMAX)}" r="3.3" fill="${r.w.color}" stroke="#fff" stroke-width="1"/>`;
  document.getElementById('hoverlayer')!.innerHTML = g;
  // tooltip html (highest cost first = top line first)
  const desc = [...rows].reverse();
  let h = `<div class="th">Month ${m} · ${S.view === 'cash' ? 'cash out' : 'true cost'}${S.infl > 0 ? ` · today's $ @${S.infl}%` : ''}</div>`;
  for (const r of desc) h += `<div class="tr"><span><i style="background:${r.w.color}"></i>${r.w.short}</span><span>${fmt(r.v)}</span></div>`;
  tip.innerHTML = h;
  const wrap = document.getElementById('chartwrap')!.getBoundingClientRect();
  let lx = ev.clientX - wrap.left + 14;
  const ty = ev.clientY - wrap.top + 10;
  if (lx > wrap.width - 205) lx = ev.clientX - wrap.left - 205;
  tip.style.left = lx + 'px';
  tip.style.top = Math.max(4, ty) + 'px';
  tip.style.opacity = '1';
}

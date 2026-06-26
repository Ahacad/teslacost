import { S, ui } from '../state';
import { MONTHS, WORLDS } from '../data/worlds';
import { pmt, balance, interp } from '../domain/amort';
import { df, prin, termOf, resaleAnchors, gasMonthly, energyMonthly, insRaw, cashOut } from '../domain/finance';
import { num } from './format';

// ---- worked example (ties every equation to the table numbers) ----
export function updateWorked(): void {
  document.getElementById('exHold')!.textContent = String(S.hold);
  const w = WORLDS.find((x) => x.key === ui.exSel) || WORLDS[2];
  const m = S.hold;
  const box = document.getElementById('worked')!;
  if (w.type === 'lease') {
    const ins = insRaw(w);
    const op = ins + S.ev;
    const cash = cashOut(w, m);
    const rate = S.infl / 100;
    box.innerHTML =
      `<b>${w.label}</b> — a lease: no loan, no equity.\n` +
      `run   = insurance ${num(ins)} + energy ${S.ev} = ${num(op)}/mo\n` +
      (rate
        ? `cash(${m}) = Σ (540 + ${num(op)}) ÷ (1+${num(rate, 3)})^(t/12) for t=1..${m} = <b>$${num(cash)}</b>   (today's $ @ ${S.infl}%)\n`
        : `cash(${m}) = (payment 540 + ${num(op)}) × ${m} = <b>$${num(cash)}</b>\n`) +
      `equity = $0  (you own nothing)\n` +
      `net    = cash − equity = <span class="ok">$${num(cash)}</span>   ← matches the table`;
    return;
  }
  const i = w.apr / 1200;
  const n = termOf(w);
  const P = prin(w);
  const p = pmt(P, w.apr, n);
  const pw = Math.pow(1 + i, m);
  const denom = 1 - Math.pow(1 + i, -n);
  const b = balance(P, w.apr, n, m);
  const anch = resaleAnchors(w);
  const r = interp(anch, m);
  const gas = gasMonthly(w);
  const en = energyMonthly(w);
  const ins = insRaw(w);
  const run = ins + w.maint + gas + en;
  const rate = S.infl / 100;
  const dfm = df(m);
  const paidM = Math.min(m, n);
  const cash = cashOut(w, m);
  const eqNom = r - b;
  const eqPV = eqNom * dfm;
  const net = cash - eqPV;
  // which two anchors bracket m, for resale interpolation
  let ai = 1;
  while (ai < MONTHS.length - 1 && m > MONTHS[ai]) ai++;
  const lo = MONTHS[ai - 1];
  const hiM = MONTHS[ai];
  const t = (m - lo) / (hiM - lo);
  const payLine =
    w.apr === 0
      ? `pmt   = P / n = ${num(P)} / ${n} = <b>$${num(p, 2)}</b>   (0% APR)`
      : `i     = APR/1200 = ${w.apr}/1200 = ${num(i, 6)}\n` +
        `pmt   = P·i / (1 − (1+i)^−n)\n` +
        `      = ${num(P)} × ${num(i, 6)} / (1 − ${num(Math.pow(1 + i, -n), 5)})\n` +
        `      = ${num(P * i, 2)} / ${num(denom, 5)} = <b>$${num(p, 2)}</b>`;
  const balLine =
    m >= n
      ? `b(${m}) = 0   (loan already paid off at month ${n})`
      : `b(${m}) = P(1+i)^m − pmt·((1+i)^m −1)/i\n` +
        `      = ${num(P)}×${num(pw, 5)} − ${num(p, 2)}×(${num(pw, 5)}−1)/${num(i, 6)} = <b>$${num(b)}</b>`;
  box.innerHTML =
    `<b>${w.label}</b>   P = $${num(P)}   n = ${n} mo   APR = ${w.apr}%\n` +
    `${payLine}\n` +
    `${balLine}\n` +
    `resale(${m}) = straight line ${lo}→${hiM}mo : ${num(anch[ai - 1])} + ${num(t, 2)}×(${num(anch[ai])}−${num(anch[ai - 1])}) = <b>$${num(r)}</b>\n` +
    `run   = ins ${num(ins)} + maint ${w.maint}${gas > 0 ? ` + ${w.type === 'phev' ? 'energy' : 'gas'} ${num(gas)}` : ''}${en > 0 ? ` + energy ${en}` : ''} = ${num(run)}/mo\n` +
    (rate
      ? `cash(${m}) = down ${num(w.upfront)} + Σ (pmt[t≤${n}] + run) ÷ (1+${num(rate, 3)})^(t/12) for t=1..${m} = <b>$${num(cash)}</b>   (today's $ @ ${S.infl}%)\n`
      : `cash(${m}) = down ${num(w.upfront)} + pmt×min(${m},${n})=${num(p * paidM)} + run×${m}=${num(run * m)} = <b>$${num(cash)}</b>\n`) +
    `equity = resale − b = ${num(r)} − ${num(b)} = $${num(eqNom)}${rate ? `  → today's $: ×${num(dfm, 4)} = $${num(eqPV)}` : ''}\n` +
    `net    = cash − ${rate ? 'PV ' : ''}equity = ${num(cash)} − ${num(rate ? eqPV : eqNom)} = <span class="ok">$${num(net)}</span>   ← matches the “Cost @ ${m}mo” cell`;
}

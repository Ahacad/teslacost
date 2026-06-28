import { S, ui } from '../state';
import { MONTHS, WORLDS } from '../data/worlds';
import { pmt, balance, interp } from '../domain/amort';
import {
  df, prin, termOf, resaleAnchors, gasMonthly, energyMonthly, insRaw, cashOut, equity, value, negEquity, delayOf,
} from '../domain/finance';
import { num } from './format';

// ---- worked example (ties every equation to the table numbers) ----
export function updateWorked(): void {
  document.getElementById('exHold')!.textContent = String(S.hold);
  const w = WORLDS.find((x) => x.key === ui.exSel) || WORLDS[2];
  const m = S.hold;
  const box = document.getElementById('worked')!;
  // Headline cash / equity / net always come straight from the engine, so the worked
  // example matches the table cell no matter how delay/loan inputs are set.
  const cash = cashOut(w, m);
  const eq = equity(w, m);
  const net = value(w, m);
  const rate = S.infl / 100;

  if (w.type === 'lease') {
    const D = delayOf(w);
    const ins = insRaw(w);
    const op = ins + S.ev;
    const head = D > 0 ? `<b>${w.label}</b> — wait ${D} mo in the Kia, then lease (no loan, no equity).\n` : `<b>${w.label}</b> — a lease: no loan, no equity.\n`;
    box.innerHTML =
      head +
      (D > 0 ? `phase 1 = keep the Kia ${D} mo; negative equity at trade = ${num(negEquity(D))} (paid in cash on a lease)\n` : '') +
      `run   = insurance ${num(ins)} + energy ${S.ev} = ${num(op)}/mo\n` +
      `cash(${m}) = <b>$${num(cash)}</b>${rate ? `   (today's $ @ ${S.infl}%)` : ''}\n` +
      `equity = $0  (you own nothing)\n` +
      `net    = cash − equity = <span class="ok">$${num(net)}</span>   ← matches the table`;
    return;
  }

  const isKiaW = w.key === 'kia';
  const D = delayOf(w);

  if (!isKiaW && m <= D) {
    box.innerHTML =
      `<b>${w.label}</b> — at month ${m} you haven't switched yet (you trade at month ${D}), so you're still in the Kia.\n` +
      `This line tracks "Keep the Kia" until month ${D}; pick a holding period past ${D} to see the ${w.short} phase.\n` +
      `cash(${m}) = <b>$${num(cash)}</b>${rate ? `   (today's $ @ ${S.infl}%)` : ''}\n` +
      `equity = $${num(eq)}  (Kia: private resale − loan balance)\n` +
      `net    = cash − equity = <span class="ok">$${num(net)}</span>   ← matches the table`;
    return;
  }

  const apr = isKiaW ? S.kiaApr : w.apr;
  const n = isKiaW ? S.kiaMonths : termOf(w);
  const P = isKiaW ? S.kiaOwed : prin(w);
  const age = Math.max(0, m - D); // months on the car you end up holding at month m
  const i = apr / 1200;
  const p = pmt(P, apr, n);
  const b = balance(P, apr, n, age);
  const anch = resaleAnchors(w);
  const r = isKiaW ? interp(anch, m) : interp(anch, age);
  const ins = insRaw(w);
  const run = ins + w.maint + gasMonthly(w) + energyMonthly(w);

  // resale interpolation bracket (on the relevant age)
  const ra = isKiaW ? m : age;
  let ai = 1;
  while (ai < MONTHS.length - 1 && ra > MONTHS[ai]) ai++;
  const lo = MONTHS[ai - 1];
  const hiM = MONTHS[ai];
  const t = (hiM - lo) ? (ra - lo) / (hiM - lo) : 0;

  // Principal line — for a delayed switch, show how the rolled negative equity enters P.
  const pLine = isKiaW
    ? `<b>${w.label}</b>   P = $${num(P)} owed   n = ${n} mo left   APR = ${apr}%\n`
    : D > 0
      ? `<b>${w.label}</b> — wait ${D} mo, then switch.\n` +
        `roll  = Kia balance b(${D})=${num(balance(S.kiaOwed, S.kiaApr, S.kiaMonths, D))} − trade value = negative equity ${num(negEquity(D))}\n` +
        `P     = own price ${num(w.principal - 9000)} + rolled ${num(negEquity(D))}${S.tradeCredit ? ' − credit 2,320' : ''} = $${num(P)}   n = ${n} mo   APR = ${apr}%\n`
      : `<b>${w.label}</b>   P = $${num(P)}   n = ${n} mo   APR = ${apr}%\n`;

  const payLine =
    apr === 0
      ? `pmt   = P / n = ${num(P)} / ${n} = <b>$${num(p, 2)}</b>   (0% APR)`
      : `pmt   = P·i / (1 − (1+i)^−n) = ${num(P)} × ${num(i, 6)} / (1 − ${num(Math.pow(1 + i, -n), 5)}) = <b>$${num(p, 2)}</b>`;
  const ageLabel = isKiaW ? `${m}` : D > 0 ? `${age} (= ${m}−${D})` : `${m}`;
  const balLine =
    age >= n
      ? `b(age ${ageLabel}) = 0   (loan paid off by then)`
      : `b(age ${ageLabel}) = P(1+i)^age − pmt·((1+i)^age −1)/i = <b>$${num(b)}</b>`;

  box.innerHTML =
    pLine +
    `${payLine}\n` +
    `${balLine}\n` +
    `resale(age ${ageLabel}) = ${num(anch[ai - 1])} + ${num(t, 2)}×(${num(anch[ai])}−${num(anch[ai - 1])}) = <b>$${num(r)}</b>\n` +
    `run   = ins ${num(ins)} + maint ${w.maint}${gasMonthly(w) > 0 ? ` + ${w.type === 'phev' ? 'energy' : 'gas'} ${num(gasMonthly(w))}` : ''}${energyMonthly(w) > 0 ? ` + energy ${S.ev}` : ''} = ${num(run)}/mo\n` +
    (D > 0 ? `cash(${m}) = [Kia ${D} mo] + [${w.short} ${m - D} mo] = <b>$${num(cash)}</b>${rate ? `   (today's $ @ ${S.infl}%)` : ''}\n` : `cash(${m}) = <b>$${num(cash)}</b>${rate ? `   (today's $ @ ${S.infl}%)` : ''}\n`) +
    `equity = resale − balance = ${num(r)} − ${num(b)} = $${num(eq)}${rate ? `  → today's $: ×${num(df(m), 4)}` : ''}\n` +
    `net    = cash − equity = <span class="ok">$${num(net)}</span>   ← matches the “Cost @ ${m}mo” cell`;
}

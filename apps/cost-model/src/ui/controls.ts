import { S, ui } from '../state';
import { WORLDS } from '../data/worlds';
import { render } from './dashboard';
import { updateWorked } from './worked';
import { onMove, drawChart } from './chart';

type NumKey = 'hold' | 'gas' | 'miles' | 'infl' | 'insMult' | 'loanTerm';

function bindRange(id: string, key: NumKey, fmtFn: (v: number) => string): void {
  const el = document.getElementById(id) as HTMLInputElement;
  const lab = document.getElementById(id + 'V')!;
  el.addEventListener('input', () => {
    S[key] = parseFloat(el.value);
    lab.textContent = fmtFn(S[key]);
    render();
  });
}

export function wire(): void {
  bindRange('hold', 'hold', (v) => String(v));
  bindRange('gas', 'gas', (v) => v.toFixed(2));
  bindRange('miles', 'miles', (v) => Math.round(v).toLocaleString());
  bindRange('infl', 'infl', (v) => v.toFixed(1));
  bindRange('insMult', 'insMult', (v) => v.toFixed(2));

  document.querySelectorAll<HTMLElement>('#evCase button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#evCase button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      S.ev = parseFloat(b.dataset.v!);
      document.getElementById('evV')!.textContent =
        (S.ev === 50 ? 'Cheap' : S.ev === 120 ? 'Winter/paid' : 'Office fails') + ' · $' + S.ev + '/mo';
      render();
    }),
  );
  document.querySelectorAll<HTMLElement>('#loanTerm button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#loanTerm button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      S.loanTerm = parseInt(b.dataset.v!);
      document.getElementById('loanTermV')!.textContent = S.loanTerm + ' mo';
      render();
    }),
  );
  document.querySelectorAll<HTMLElement>('#view button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#view button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      S.view = b.dataset.v === 'cash' ? 'cash' : 'net';
      render();
    }),
  );
  (document.getElementById('conserv') as HTMLInputElement).addEventListener('change', (e) => {
    S.conserv = (e.target as HTMLInputElement).checked;
    render();
  });
  (document.getElementById('tradeCredit') as HTMLInputElement).addEventListener('change', (e) => {
    S.tradeCredit = (e.target as HTMLInputElement).checked;
    render();
  });

  // worked-example world picker
  const sel = document.getElementById('exWorld') as HTMLSelectElement;
  sel.innerHTML = WORLDS.map((w) => `<option value="${w.key}" ${w.key === ui.exSel ? 'selected' : ''}>${w.label}</option>`).join('');
  sel.addEventListener('change', () => {
    ui.exSel = sel.value;
    updateWorked();
  });

  // chart hover
  const svg = document.getElementById('chart')!;
  svg.addEventListener('mousemove', onMove);
  svg.addEventListener('mouseleave', () => {
    document.getElementById('tip')!.style.opacity = '0';
    const h = document.getElementById('hoverlayer');
    if (h) h.innerHTML = '';
    if (ui.hi) {
      ui.hi = null;
      drawChart();
    }
  });
}

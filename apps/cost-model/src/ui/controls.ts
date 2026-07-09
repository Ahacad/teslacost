import { S, ui } from '../state';
import { WORLDS, MILES_BASE } from '../data/worlds';
import { render } from './dashboard';
import { updateWorked } from './worked';
import { onMove, drawChart } from './chart';

type NumKey =
  | 'hold' | 'gas' | 'miles' | 'infl' | 'insMult' | 'loanTerm'
  | 'delay' | 'kiaOwed' | 'kiaApr' | 'kiaMonths' | 'insKia' | 'insMy'
  | 'kiaOffer' | 'buyApr' | 'myDown';

function bindRange(id: string, key: NumKey, fmtFn: (v: number) => string): void {
  const el = document.getElementById(id) as HTMLInputElement;
  const lab = document.getElementById(id + 'V')!;
  el.addEventListener('input', () => {
    S[key] = parseFloat(el.value);
    lab.textContent = fmtFn(S[key]);
    render();
  });
}

function evLabel(): void {
  const scaled = Math.round((S.ev * S.miles) / MILES_BASE);
  document.getElementById('evV')!.textContent =
    (S.ev === 25 ? 'Apt free L2' : S.ev === 50 ? 'Cheap' : S.ev === 120 ? 'Winter/paid' : 'Office fails') + ' · ~$' + scaled + '/mo';
}

export function wire(): void {
  bindRange('hold', 'hold', (v) => String(v));
  bindRange('gas', 'gas', (v) => v.toFixed(2));
  bindRange('miles', 'miles', (v) => Math.round(v).toLocaleString());
  document.getElementById('miles')!.addEventListener('input', evLabel);
  bindRange('infl', 'infl', (v) => v.toFixed(1));
  bindRange('insMult', 'insMult', (v) => v.toFixed(2));
  bindRange('delay', 'delay', (v) => (v === 0 ? 'switch now' : `wait ${v} mo`));
  bindRange('kiaOwed', 'kiaOwed', (v) => Math.round(v).toLocaleString());
  bindRange('kiaApr', 'kiaApr', (v) => v.toFixed(1) + '%');
  bindRange('kiaMonths', 'kiaMonths', (v) => Math.round(v) + ' mo');
  bindRange('insKia', 'insKia', (v) => String(Math.round(v)));
  bindRange('insMy', 'insMy', (v) => String(Math.round(v)));
  bindRange('kiaOffer', 'kiaOffer', (v) => Math.round(v).toLocaleString());
  bindRange('myDown', 'myDown', (v) => Math.round(v).toLocaleString());
  bindRange('buyApr', 'buyApr', (v) => (v === 0 ? 'row rate' : v.toFixed(2) + '%'));

  document.querySelectorAll<HTMLElement>('#evCase button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#evCase button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      S.ev = parseFloat(b.dataset.v!);
      evLabel();
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
  document.querySelectorAll<HTMLElement>('#barTier button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#barTier button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      ui.barTier = b.dataset.v!;
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
  (document.getElementById('fsd') as HTMLInputElement).addEventListener('change', (e) => {
    S.fsd = (e.target as HTMLInputElement).checked;
    render();
  });

  // left dock expand/collapse: the whole collapsed rail is a click target; when
  // open, only the header button toggles (clicks inside must reach the sliders).
  const dock = document.getElementById('dock')!;
  const toggle = document.getElementById('dockToggle')!;
  const setDock = (open: boolean) => {
    dock.classList.toggle('open', open);
    document.body.classList.toggle('dock-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setDock(!dock.classList.contains('open'));
  });
  dock.addEventListener('click', () => {
    if (!dock.classList.contains('open')) setDock(true);
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

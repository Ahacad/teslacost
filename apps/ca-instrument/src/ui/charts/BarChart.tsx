import type { JSX } from 'preact';
import { money } from '@state/format';
import { niceMax } from './chart-math';
import { showTip, hideTip } from './tooltip';

export interface BarGroup {
  label: string;
  full?: string;
  /** values in base currency, one per series */
  vals: number[];
}
export interface BarSeries {
  name: string;
  color: string;
}
interface Props {
  groups: BarGroup[];
  series: BarSeries[];
  height?: number;
}

const W = 1000;
const PAD_L = 58;
const PAD_R = 14;
const PAD_T = 24;
const PAD_B = 46;

export function BarChart({ groups, series, height = 300 }: Props) {
  const iw = W - PAD_L - PAD_R;
  const ih = height - PAD_T - PAD_B;
  let rawMax = 0;
  for (const g of groups) for (const v of g.vals) rawMax = Math.max(rawMax, v);
  const max = niceMax(rawMax);

  const gridlines: JSX.Element[] = [];
  for (let t = 0; t <= 4; t++) {
    const yv = (max * t) / 4;
    const y = PAD_T + ih - (ih * t) / 4;
    gridlines.push(<line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#E3DCCC" stroke-width="1" />);
    gridlines.push(
      <text x={PAD_L - 9} y={y + 4} text-anchor="end" class="axislbl">
        {money(yv)}
      </text>,
    );
  }

  const gW = iw / groups.length;
  const bw = Math.min(gW / (series.length + 0.7), 48);
  const bars: JSX.Element[] = [];

  groups.forEach((g, gi) => {
    const gx = PAD_L + gi * gW;
    const totW = series.length * bw + (series.length - 1) * 7;
    const sx = gx + (gW - totW) / 2;
    series.forEach((se, si) => {
      const v = g.vals[si];
      const bh = (ih * v) / max;
      const x = sx + si * (bw + 7);
      const y = PAD_T + ih - bh;
      const onMove = (ev: JSX.TargetedMouseEvent<SVGRectElement>) => {
        (ev.currentTarget as SVGRectElement).style.filter = 'brightness(1.12)';
        showTip(
          `<div class="tt">${g.full || g.label}</div><div class="tr"><span>${se.name}</span><b>${money(v)}</b></div>`,
          ev.clientX,
          ev.clientY,
        );
      };
      const onLeave = (ev: JSX.TargetedMouseEvent<SVGRectElement>) => {
        (ev.currentTarget as SVGRectElement).style.filter = '';
        hideTip();
      };
      bars.push(
        <rect
          x={x}
          y={y}
          width={bw}
          height={Math.max(bh, 0.5)}
          rx={4}
          fill={se.color}
          class="bar anim"
          style={{ animationDelay: `${gi * 0.05 + si * 0.04}s` }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        />,
      );
      bars.push(
        <text x={x + bw / 2} y={y - 6} text-anchor="middle" class="barval">
          {money(v)}
        </text>,
      );
    });
    bars.push(
      <text x={gx + gW / 2} y={height - PAD_B + 18} text-anchor="middle" class="axislbl">
        {g.label}
      </text>,
    );
  });

  return (
    <svg viewBox={`0 0 ${W} ${height}`}>
      {gridlines}
      {bars}
    </svg>
  );
}

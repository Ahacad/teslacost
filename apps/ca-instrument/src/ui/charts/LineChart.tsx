import type { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import type { CumulativePoint } from '@domain/cumulative';
import { money } from '@state/format';
import { niceMax } from './chart-math';
import { showTip, hideTip } from './tooltip';

export interface LineSeries {
  name: string;
  color: string;
  pts: CumulativePoint[];
  /** optional hollow marker at a net-of-resale value */
  dashEnd?: number | null;
}
interface Props {
  lines: LineSeries[];
  height?: number;
}

const W = 1000;
const PAD_L = 64;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 44;

export function LineChart({ lines, height = 330 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const iw = W - PAD_L - PAD_R;
  const ih = height - PAD_T - PAD_B;
  const xmax = Math.max(...lines.map((l) => l.pts[l.pts.length - 1].month));
  let rawY = 0;
  for (const l of lines) for (const p of l.pts) rawY = Math.max(rawY, p.total);
  const ymax = niceMax(rawY);

  const X = (x: number) => PAD_L + (iw * x) / xmax;
  const Y = (y: number) => PAD_T + ih - (ih * y) / ymax;

  const onMove = (ev: JSX.TargetedMouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const sx = ((ev.clientX - r.left) / r.width) * W;
    let m = Math.round(((sx - PAD_L) / iw) * xmax);
    m = Math.max(0, Math.min(xmax, m));
    setActive(m);
    const rows = lines
      .map(
        (l) =>
          `<div class="tr"><span style="color:${l.color}">●</span><span>${l.name}</span><b>${money(l.pts[m].total)}</b></div>`,
      )
      .join('');
    showTip(
      `<div class="tt">Year ${(m / 12).toFixed(1)} · month ${m}</div>${rows}`,
      ev.clientX,
      ev.clientY,
    );
  };
  const onLeave = () => {
    setActive(null);
    hideTip();
  };

  return (
    <svg viewBox={`0 0 ${W} ${height}`} ref={svgRef}>
      <defs>
        {lines.map((l, i) => (
          <linearGradient id={`g${i}`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stop-color={l.color} stop-opacity={0.16} />
            <stop offset={1} stop-color={l.color} stop-opacity={0} />
          </linearGradient>
        ))}
      </defs>

      {[0, 1, 2, 3, 4].map((t) => {
        const yv = (ymax * t) / 4;
        const y = PAD_T + ih - (ih * t) / 4;
        return (
          <>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#E3DCCC" />
            <text x={PAD_L - 9} y={y + 4} text-anchor="end" class="axislbl">
              {money(yv)}
            </text>
          </>
        );
      })}

      {Array.from({ length: Math.floor(xmax / 12) + 1 }, (_, k) => k * 12).map((m) => {
        const x = X(m);
        return (
          <>
            <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + ih} stroke="#EEE7D8" />
            <text x={x} y={height - PAD_B + 18} text-anchor="middle" class="axislbl">
              {m / 12}y
            </text>
          </>
        );
      })}

      {lines.map((l, i) => {
        const linePath = l.pts
          .map((p, j) => `${j ? 'L' : 'M'}${X(p.month).toFixed(1)} ${Y(p.total).toFixed(1)}`)
          .join(' ');
        const areaPath =
          `M${X(l.pts[0].month)} ${Y(0)}` +
          l.pts.map((p) => `L${X(p.month).toFixed(1)} ${Y(p.total).toFixed(1)}`).join('') +
          `L${X(l.pts[l.pts.length - 1].month)} ${Y(0)}Z`;
        const last = l.pts[l.pts.length - 1];
        return (
          <>
            <path d={areaPath} fill={`url(#g${i})`} class="area anim" />
            <path
              d={linePath}
              fill="none"
              stroke={l.color}
              stroke-width={2.6}
              stroke-linejoin="round"
              class="line anim"
              pathLength={1}
            />
            <circle cx={X(last.month)} cy={Y(last.total)} r={3.8} fill={l.color} />
            <text x={X(last.month) - 6} y={Y(last.total) - 9} text-anchor="end" class="endlbl" fill={l.color}>
              {money(last.total)}
            </text>
            {l.dashEnd != null && (
              <circle cx={X(last.month)} cy={Y(l.dashEnd)} r={3} fill="none" stroke={l.color} stroke-dasharray="2 2" />
            )}
          </>
        );
      })}

      {active != null && (
        <>
          <line x1={X(active)} y1={PAD_T} x2={X(active)} y2={PAD_T + ih} stroke="#171309" stroke-width={1} opacity={0.4} />
          {lines.map((l) => (
            <circle cx={X(active)} cy={Y(l.pts[active].total)} r={4} fill="#fff" stroke={l.color} stroke-width={2} />
          ))}
        </>
      )}

      <rect x={PAD_L} y={PAD_T} width={iw} height={ih} fill="transparent" onMouseMove={onMove} onMouseLeave={onLeave} />
    </svg>
  );
}

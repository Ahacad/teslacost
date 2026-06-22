import { useLayoutEffect, useRef } from 'preact/hooks';
import { tip } from './tooltip';

/** A single fixed-position tooltip driven by the shared `tip` signal. */
export function Tooltip() {
  const ref = useRef<HTMLDivElement>(null);
  const t = tip.value;

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !t.show) return;
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    let left = t.x + 14;
    let top = t.y - h - 10;
    if (left + w > window.innerWidth - 8) left = t.x - w - 14;
    if (top < 8) top = t.y + 18;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
  });

  return (
    <div
      id="tip"
      ref={ref}
      style={{ opacity: t.show ? 1 : 0 }}
      dangerouslySetInnerHTML={{ __html: t.html }}
    />
  );
}

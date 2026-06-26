import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Animate a number from its previous value to `target` with an ease-out cubic.
 * Returns the current in-flight value (in the same units as `target`) so the
 * caller can format it however it likes. Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, durationMs = 620): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const reduce =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduce || from === target) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

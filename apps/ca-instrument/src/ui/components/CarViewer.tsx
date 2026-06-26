import { useEffect, useRef, useState } from 'preact/hooks';
import { hexToRgb01 } from '@data/models3d';

interface MvMaterial {
  name: string;
  pbrMetallicRoughness: { setBaseColorFactor(c: number[]): void };
}
interface MvElement extends HTMLElement {
  model?: { materials: MvMaterial[] };
}

interface Props {
  src: string;
  poster: string;
  alt: string;
  paintHex?: string;
  autoRotate?: boolean;
}

/**
 * Lazy <model-viewer> wrapper. Shows the poster immediately and only imports the
 * ~71 KB model-viewer chunk on first viewport intersection. Degrades to the
 * poster image under prefers-reduced-motion (no auto-rotate) and on any load
 * failure (WebGL/script error).
 */
export function CarViewer({ src, poster, alt, paintHex, autoRotate = true }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<MvElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load the custom-element definition on first intersection.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || ready || failed) return;
    let cancelled = false;
    const load = () => {
      import('@google/model-viewer')
        .then(() => !cancelled && setReady(true))
        .catch(() => !cancelled && setFailed(true));
    };
    if (typeof IntersectionObserver !== 'function') { load(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
    });
    io.observe(host);
    return () => { cancelled = true; io.disconnect(); };
  }, [ready, failed]);

  // Recolor the body material when the paint changes (and once the model loads).
  useEffect(() => {
    const el = mvRef.current;
    if (!ready || !el || !paintHex) return;
    const apply = () => {
      try {
        const mats = el.model?.materials ?? [];
        const body = mats.find((m) => /body|paint|car|exterior/i.test(m.name)) ?? mats[0];
        body?.pbrMetallicRoughness.setBaseColorFactor(hexToRgb01(paintHex));
      } catch {
        /* material layout varies per asset; recolor is best-effort */
      }
    };
    if (el.model) apply();
    el.addEventListener('load', apply);
    return () => el.removeEventListener('load', apply);
  }, [ready, paintHex, src]);

  if (failed) return <img class="carviewer-poster" src={poster} alt={alt} />;

  return (
    <div class="carviewer" ref={hostRef}>
      {ready ? (
        <model-viewer
          ref={mvRef as never}
          src={src}
          poster={poster}
          alt={alt}
          camera-controls
          touch-action="pan-y"
          auto-rotate={autoRotate && !reduced}
          interaction-prompt="none"
          camera-orbit="-28deg 78deg 105%"
          environment-image="neutral"
          shadow-intensity="1"
          shadow-softness="1"
          exposure="1"
          reveal="auto"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <img class="carviewer-poster" src={poster} alt={alt} />
      )}
    </div>
  );
}

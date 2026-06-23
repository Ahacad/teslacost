import type { Vehicle } from '@domain/types';

export interface ModelAttribution {
  author: string;
  url: string;
  license: string;
}

export interface ModelAsset {
  /** GLB URL, resolved against the app's base path. */
  glb: string;
  /** poster image shown before (and instead of, on failure) the 3D model. */
  poster: string;
  /** CC-BY credit, rendered in the footer; filled when the asset is sourced. */
  attribution?: ModelAttribution;
}

// BASE_URL is '/' in dev/test and './' for the relative-path production build,
// so model paths resolve under GitHub Pages subpaths too.
const BASE = import.meta.env.BASE_URL;

/** Low-poly assets per model family, keyed by `Vehicle.model`. */
export const MODEL_ASSETS: Record<string, ModelAsset> = {
  'Model 3': { glb: `${BASE}models/model3.glb`, poster: `${BASE}models/model3.webp` },
  'Model Y': { glb: `${BASE}models/modely.glb`, poster: `${BASE}models/modely.webp` },
};

/** Used when a vehicle's model family has no registered asset. */
const FALLBACK: ModelAsset = MODEL_ASSETS['Model 3'];

/**
 * Resolve the 3D asset for a vehicle: a per-trim override wins, else the
 * model-family default, else a fallback so the viewer always has a URL.
 */
export function assetFor(vehicle: Vehicle): ModelAsset {
  if (vehicle.glb) {
    const family = MODEL_ASSETS[vehicle.model];
    return { glb: vehicle.glb, poster: vehicle.poster ?? family?.poster ?? FALLBACK.poster };
  }
  return MODEL_ASSETS[vehicle.model] ?? FALLBACK;
}

/** "#1763a8" → [r, g, b, 1] each in 0..1, for model-viewer setBaseColorFactor. */
export function hexToRgb01(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255, 1];
}

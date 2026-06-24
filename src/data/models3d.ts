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

// Real, recognizable Tesla meshes, web-prepped by scripts/process-meshes.mjs
// (provenance + license there and in docs/superpowers/ASSETS.md). Each is decimated
// and reduced to a single `body` material so the paint recolor binds the shell
// alone. Posters are front-3/4 renders of the actual mesh. Swap stays data-only.
const M3_CREDIT: ModelAttribution = {
  author: 'Tesla Model 3 by OneSteven (Sketchfab)',
  url: 'https://sketchfab.com/3d-models/tesla-model-3-117d7dbdd6f94df9886c42995cdd06db',
  license: 'CC-BY-NC 4.0',
};
const MY_CREDIT: ModelAttribution = {
  author: 'Tesla Model Y by 3D Hawk (downloadfree3d)',
  url: 'https://downloadfree3d.com/3d-models/vehicles/car/tesla-model-y/',
  license: 'free, non-commercial',
};

/** Real Tesla assets per model family, keyed by `Vehicle.model`. */
export const MODEL_ASSETS: Record<string, ModelAsset> = {
  'Model 3': { glb: `${BASE}models/model3.glb`, poster: `${BASE}models/model3.png`, attribution: M3_CREDIT },
  'Model Y': { glb: `${BASE}models/modely.glb`, poster: `${BASE}models/modely.png`, attribution: MY_CREDIT },
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

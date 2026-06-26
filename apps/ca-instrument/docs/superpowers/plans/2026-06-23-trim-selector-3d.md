# Trim Selector + 3D "Your Car" Focus Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Front the page with a user-selected trim — pick model + trim, spin a low-poly 3D car, and read that trim's finance/lease/cash numbers beside it — while the full lineup table/charts stay as context.

**Architecture:** A presentation + state layer over the untouched `src/domain/` cost engine. New `selectedVehicleKey` signal + `selectedScenario` computed reuse the existing `scenarioByKey`. A new `CarFocus` panel (selector + `<model-viewer>` wrapper + cost summary) replaces `Hero`. The scenario table gains a click-to-select + highlight, bidirectionally bound to the same signal. 3D assets are data-driven (a GLB URL per model family), so any car is swappable with zero code change.

**Tech Stack:** Preact 10 + `@preact/signals` + Vite + TypeScript + Vitest/`@testing-library/preact`; Google `<model-viewer>` (Apache-2.0 web component, lazy-loaded as its own chunk).

**Spec:** `docs/superpowers/specs/2026-06-23-trim-selector-3d-design.md`

---

## File Structure

**Create:**
- `src/data/models3d.ts` — 3D asset registry (`MODEL_ASSETS` keyed by model family), `assetFor(vehicle)` resolver, `hexToRgb01()` paint helper.
- `src/vite-env.d.ts` — pulls in `vite/client` types so `import.meta.env.BASE_URL` is typed.
- `src/ui/components/model-viewer.d.ts` — JSX typing for the `<model-viewer>` custom element under Preact.
- `src/ui/components/TrimSelector.tsx` — model toggle + trim chips bound to `selectedVehicleKey`.
- `src/ui/components/CarViewer.tsx` — thin lazy wrapper around `<model-viewer>` (poster-first, recolor, reduced-motion + failure fallback).
- `src/ui/components/CarFocus.tsx` — the "your car" panel composing selector + viewer + cost summary + paint swatches + `CurrencySwitch`.
- `public/models/` — `model3.glb`, `modely.glb`, `model3.webp`, `modely.webp` (Task 7).
- Tests: `test/state/selection.test.ts`, `test/data/models3d.test.ts`, `test/ui/TrimSelector.test.tsx`, `test/ui/CarViewer.test.tsx`, `test/ui/CarFocus.test.tsx`.

**Modify:**
- `src/state/settings.ts` — add `selectedVehicleKey` signal, `selectedScenario` computed, reset in `setMarket`.
- `src/domain/types.ts` — optional `glb?` / `poster?` per-trim overrides on `Vehicle`.
- `src/ui/App.tsx` — swap `<Hero/>` → `<CarFocus/>`.
- `src/ui/components/ScenarioTable.tsx` — selected-row highlight + click-to-select.
- `src/ui/components/Footer.tsx` — CC-BY mesh attribution + "not affiliated with Tesla" disclaimer.
- `src/styles/app.css` — styles for the focus panel, selector, viewer, swatches, selected row.
- `test/ui/ScenarioTable.test.tsx` — selection highlight + click tests.

**Delete:**
- `src/ui/components/Hero.tsx` — replaced by `CarFocus`; only `App.tsx` imports it.

---

## Task 1: Selected-trim state

**Files:**
- Modify: `src/state/settings.ts`
- Test: `test/state/selection.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/state/selection.test.ts`:

```ts
import { afterEach, describe, it, expect } from 'vitest';
import { selectedVehicleKey, selectedScenario, setMarket } from '@state/settings';
import { DEFAULT_MARKET, marketById } from '@data/markets';

// state is module-global; restore the default market (also resets the selection)
afterEach(() => setMarket('CA'));

describe('selected-trim state', () => {
  it('defaults to the first vehicle of the default market', () => {
    expect(selectedVehicleKey.value).toBe(DEFAULT_MARKET.vehicles[0].key);
    expect(selectedScenario.value.vehicle.key).toBe(DEFAULT_MARKET.vehicles[0].key);
  });

  it('selectedScenario tracks selectedVehicleKey', () => {
    selectedVehicleKey.value = 'myperf';
    expect(selectedScenario.value.vehicle.key).toBe('myperf');
    expect(selectedScenario.value.vehicle.name).toBe('Model Y Performance');
  });

  it('setMarket resets the selection to the new market first vehicle', () => {
    selectedVehicleKey.value = 'myperf';
    setMarket('US');
    expect(selectedVehicleKey.value).toBe(marketById('US').vehicles[0].key);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/state/selection.test.ts`
Expected: FAIL — `selectedVehicleKey`/`selectedScenario` are not exported from `@state/settings`.

- [ ] **Step 3: Add the state**

In `src/state/settings.ts`, at the very end of the file (after `scenarioByKey`), append:

```ts
// ---- selected trim (the "your car" focus) ----
export const selectedVehicleKey = signal(DEFAULT_MARKET.vehicles[0].key);
export const selectedScenario = computed(() => scenarioByKey(selectedVehicleKey.value));
```

Then, inside `setMarket(id)`, add this line at the end of the function body (after `aprOverride.value = null;`):

```ts
  selectedVehicleKey.value = m.vehicles[0].key;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/state/selection.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/state/settings.ts test/state/selection.test.ts
git commit -m "feat: add selected-trim state (selectedVehicleKey + selectedScenario)"
```

---

## Task 2: 3D asset registry + helpers

**Files:**
- Create: `src/data/models3d.ts`
- Create: `src/vite-env.d.ts`
- Modify: `src/domain/types.ts`
- Test: `test/data/models3d.test.ts`

- [ ] **Step 1: Add the Vite client types + Vehicle overrides**

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

In `src/domain/types.ts`, inside the `Vehicle` interface, add after the `moneyFactor?` field (before the closing `}`):

```ts
  /** optional per-trim 3D asset overrides; absent → the model-family default */
  glb?: string;
  poster?: string;
```

- [ ] **Step 2: Write the failing test**

Create `test/data/models3d.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { assetFor, hexToRgb01, MODEL_ASSETS } from '@data/models3d';
import type { Vehicle } from '@domain/types';

const base: Vehicle = {
  key: 'x', name: 'X', model: 'Model 3', base: 40000,
  financeDown: 4300, residualPct: 41.5, residualConfirmed: true,
};

describe('assetFor', () => {
  it('returns the model-family default when there is no override', () => {
    expect(assetFor(base)).toBe(MODEL_ASSETS['Model 3']);
  });

  it('honors a per-trim glb override', () => {
    expect(assetFor({ ...base, glb: '/custom/foo.glb' }).glb).toBe('/custom/foo.glb');
  });

  it('falls back to a real asset for an unknown family', () => {
    expect(assetFor({ ...base, model: 'Cybertruck' }).glb).toBeTruthy();
  });
});

describe('hexToRgb01', () => {
  it('converts white', () => expect(hexToRgb01('#ffffff')).toEqual([1, 1, 1, 1]));
  it('converts black', () => expect(hexToRgb01('#000000')).toEqual([0, 0, 0, 1]));
  it('converts pure red', () => {
    const [r, g, b] = hexToRgb01('#ff0000');
    expect([r, g, b]).toEqual([1, 0, 0]);
  });
  it('expands shorthand hex', () => expect(hexToRgb01('#fff')).toEqual([1, 1, 1, 1]));
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run test/data/models3d.test.ts`
Expected: FAIL — `@data/models3d` does not exist.

- [ ] **Step 4: Implement the registry**

Create `src/data/models3d.ts`:

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/data/models3d.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/models3d.ts src/vite-env.d.ts src/domain/types.ts test/data/models3d.test.ts
git commit -m "feat: add 3D asset registry (assetFor + hexToRgb01)"
```

---

## Task 3: TrimSelector component

**Files:**
- Create: `src/ui/components/TrimSelector.tsx`
- Test: `test/ui/TrimSelector.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/ui/TrimSelector.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { TrimSelector } from '@ui/components/TrimSelector';
import { selectedVehicleKey, setMarket } from '@state/settings';

afterEach(() => { setMarket('CA'); cleanup(); });

describe('<TrimSelector>', () => {
  it('renders a toggle for each model family', () => {
    const { getByText } = render(<TrimSelector />);
    expect(getByText('Model 3')).toBeTruthy();
    expect(getByText('Model Y')).toBeTruthy();
  });

  it('clicking a trim chip updates selectedVehicleKey', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<TrimSelector />);
    fireEvent.click(getByText('Performance'));
    expect(selectedVehicleKey.value).toBe('m3perf');
  });

  it('clicking a model toggle selects that family first trim', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<TrimSelector />);
    fireEvent.click(getByText('Model Y'));
    expect(selectedVehicleKey.value).toBe('myrwd');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/ui/TrimSelector.test.tsx`
Expected: FAIL — `@ui/components/TrimSelector` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/ui/components/TrimSelector.tsx`:

```tsx
import { activeMarket, selectedVehicleKey } from '@state/settings';

/** Segmented model toggle + trim chips driving the selected-trim focus. */
export function TrimSelector() {
  const vehicles = activeMarket.value.vehicles;
  const sel = selectedVehicleKey.value;
  const models = [...new Set(vehicles.map((v) => v.model))];
  const selModel = vehicles.find((v) => v.key === sel)?.model ?? models[0];

  return (
    <div class="trimsel">
      <div class="seg" role="tablist" aria-label="model">
        {models.map((m) => {
          const firstOfModel = vehicles.find((v) => v.model === m)!;
          return (
            <button
              class={selModel === m ? 'on' : ''}
              onClick={() => (selectedVehicleKey.value = firstOfModel.key)}
            >
              {m}
            </button>
          );
        })}
      </div>
      <div class="trimsel-trims" role="tablist" aria-label="trim">
        {vehicles
          .filter((v) => v.model === selModel)
          .map((v) => (
            <button
              class={`chip ${v.key === sel ? 'on' : ''}`}
              onClick={() => (selectedVehicleKey.value = v.key)}
            >
              {v.name.replace(v.model, '').trim() || v.name}
            </button>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/ui/TrimSelector.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/TrimSelector.tsx test/ui/TrimSelector.test.tsx
git commit -m "feat: add TrimSelector (model toggle + trim chips)"
```

---

## Task 4: CarViewer (lazy `<model-viewer>` wrapper)

**Files:**
- Create: `src/ui/components/model-viewer.d.ts`
- Create: `src/ui/components/CarViewer.tsx`
- Test: `test/ui/CarViewer.test.tsx`
- Add dependency: `@google/model-viewer`

- [ ] **Step 1: Install model-viewer**

Run: `npm install @google/model-viewer`
Expected: adds `@google/model-viewer` to `dependencies` in `package.json`.

- [ ] **Step 2: Add the JSX typing for the custom element**

Create `src/ui/components/model-viewer.d.ts`:

```ts
import type { JSX } from 'preact';

interface ModelViewerAttributes extends JSX.HTMLAttributes<HTMLElement> {
  src?: string;
  poster?: string;
  alt?: string;
  ar?: boolean;
  'auto-rotate'?: boolean;
  'rotation-per-second'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'disable-zoom'?: boolean;
  'interaction-prompt'?: 'auto' | 'none';
  'shadow-intensity'?: string | number;
  exposure?: string | number;
  reveal?: 'auto' | 'interaction' | 'manual';
  loading?: 'auto' | 'lazy' | 'eager';
}

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}
```

- [ ] **Step 3: Write the failing test**

Create `test/ui/CarViewer.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { CarViewer } from '@ui/components/CarViewer';

// Stub IntersectionObserver so it never fires → the 3D chunk is never imported,
// and the render stays deterministically on the poster.
beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(cleanup);

describe('<CarViewer>', () => {
  it('renders the poster image immediately (before the 3D chunk loads)', () => {
    const { container } = render(
      <CarViewer src="/models/x.glb" poster="/models/x.webp" alt="X car" />,
    );
    const img = container.querySelector('img.carviewer-poster') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/models/x.webp');
    expect(img.getAttribute('alt')).toBe('X car');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run test/ui/CarViewer.test.tsx`
Expected: FAIL — `@ui/components/CarViewer` does not exist.

- [ ] **Step 5: Implement the wrapper**

Create `src/ui/components/CarViewer.tsx`:

```tsx
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
          shadow-intensity="1"
          exposure="0.9"
          reveal="auto"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <img class="carviewer-poster" src={poster} alt={alt} />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run test/ui/CarViewer.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/ui/components/CarViewer.tsx src/ui/components/model-viewer.d.ts test/ui/CarViewer.test.tsx
git commit -m "feat: add CarViewer lazy model-viewer wrapper"
```

---

## Task 5: CarFocus panel

**Files:**
- Create: `src/ui/components/CarFocus.tsx`
- Test: `test/ui/CarFocus.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/ui/CarFocus.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/preact';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { CarFocus } from '@ui/components/CarFocus';
import { selectedVehicleKey, setMarket } from '@state/settings';

beforeEach(() => {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(() => { setMarket('CA'); cleanup(); });

describe('<CarFocus>', () => {
  it('shows the selected trim name', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<CarFocus />);
    expect(getByText('Model 3 Premium RWD')).toBeTruthy();
  });

  it('reflects a different selection', () => {
    selectedVehicleKey.value = 'myperf';
    const { getByText } = render(<CarFocus />);
    expect(getByText('Model Y Performance')).toBeTruthy();
  });

  it('renders the car poster image', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { container } = render(<CarFocus />);
    expect(container.querySelector('img.carviewer-poster')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/ui/CarFocus.test.tsx`
Expected: FAIL — `@ui/components/CarFocus` does not exist.

- [ ] **Step 3: Implement the panel**

Create `src/ui/components/CarFocus.tsx`:

```tsx
import { useState } from 'preact/hooks';
import { selectedScenario } from '@state/settings';
import { assetFor } from '@data/models3d';
import { money } from '@state/format';
import { AnimatedMoney } from './Money';
import { CurrencySwitch } from './CurrencySwitch';
import { TrimSelector } from './TrimSelector';
import { CarViewer } from './CarViewer';

// Visual-only paint chips (no cost effect) — the recolor is purely cosmetic.
const PAINTS: Array<[string, string]> = [
  ['Pearl White', '#e9e9ea'],
  ['Solid Black', '#1c1c1e'],
  ['Stealth Grey', '#5b5e62'],
  ['Deep Blue', '#1f3a63'],
  ['Ultra Red', '#a31212'],
];

function Num({ lab, val, sub, suffix }: { lab: string; val: number; sub: string; suffix?: string }) {
  return (
    <div class="carfocus-num">
      <div class="lab">{lab}</div>
      <div class="v num"><AnimatedMoney value={val} suffix={suffix} /></div>
      <div class="d">{sub}</div>
    </div>
  );
}

/** The "your car" focus panel: selector + 3D car + that trim's numbers. */
export function CarFocus() {
  const [paint, setPaint] = useState(PAINTS[0][1]);
  const s = selectedScenario.value;
  const asset = assetFor(s.vehicle);
  const m = s.methods;

  return (
    <div class="carfocus reveal" style={{ animationDelay: '.06s' }}>
      <div class="carfocus-head">
        <div>
          <div class="lead">your car</div>
          <div class="carfocus-name">{s.vehicle.name}</div>
        </div>
        <CurrencySwitch />
      </div>

      <TrimSelector />

      <div class="carfocus-body">
        <div class="carfocus-stage">
          <CarViewer
            src={asset.glb}
            poster={asset.poster}
            alt={`${s.vehicle.name} 3D model`}
            paintHex={paint}
          />
          <div class="paints" role="listbox" aria-label="paint">
            {PAINTS.map(([name, hex]) => (
              <button
                class={`swatch ${paint === hex ? 'on' : ''}`}
                title={name}
                aria-label={name}
                style={{ background: hex }}
                onClick={() => setPaint(hex)}
              />
            ))}
          </div>
        </div>

        <div class="carfocus-nums">
          <Num lab="Finance · all-in / mo" val={m.finance.allIn} suffix="/mo" sub={`${money(m.finance.upfront)} down`} />
          <Num lab="Lease · all-in / mo" val={m.lease.allIn} suffix="/mo" sub={`${money(m.lease.upfront)} to start`} />
          <Num lab="Cash · drive-off" val={m.cash.upfront} sub="full price, taxes in" />
          <Num lab="8-yr net · finance" val={m.finance.net8} sub="net of resale" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/ui/CarFocus.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/CarFocus.tsx test/ui/CarFocus.test.tsx
git commit -m "feat: add CarFocus 'your car' panel"
```

---

## Task 6: Integration — App swap, table sync, footer

**Files:**
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/components/ScenarioTable.tsx`
- Modify: `src/ui/components/Footer.tsx`
- Modify: `test/ui/ScenarioTable.test.tsx`
- Delete: `src/ui/components/Hero.tsx`

- [ ] **Step 1: Write the failing table tests**

Replace the top of `test/ui/ScenarioTable.test.tsx` (imports + `afterEach`) with:

```tsx
// @vitest-environment jsdom
import { render, cleanup, fireEvent } from '@testing-library/preact';
import { afterEach, describe, it, expect } from 'vitest';
import { ScenarioTable } from '@ui/components/ScenarioTable';
import { VEHICLES } from '@data/vehicles';
import { selectedVehicleKey, setMarket } from '@state/settings';

afterEach(() => { setMarket('CA'); cleanup(); });
```

Then add these two tests inside the `describe('<ScenarioTable>', ...)` block:

```tsx
  it('marks the selected vehicle row group with .sel', () => {
    selectedVehicleKey.value = 'm3perf';
    const { container } = render(<ScenarioTable />);
    expect(container.querySelectorAll('tr.sel')).toHaveLength(3);
  });

  it('clicking a row selects that vehicle', () => {
    selectedVehicleKey.value = 'm3rwd';
    const { getByText } = render(<ScenarioTable />);
    fireEvent.click(getByText('Model Y Performance'));
    expect(selectedVehicleKey.value).toBe('myperf');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/ui/ScenarioTable.test.tsx`
Expected: FAIL — no `tr.sel`; click does not change `selectedVehicleKey`.

- [ ] **Step 3: Wire selection into the table**

In `src/ui/components/ScenarioTable.tsx`, update the import on line 2 to add `selectedVehicleKey`:

```ts
import { scenarios, activeMarket, selectedVehicleKey } from '@state/settings';
```

In the `Row` component, replace the opening `<tr ...>` line:

```tsx
    <tr class={first ? 'grp' : ''}>
```

with (compute `sel` just above the `return` and bind class + click):

```tsx
    <tr
      class={`${first ? 'grp ' : ''}${s.vehicle.key === selectedVehicleKey.value ? 'sel' : ''}`}
      onClick={() => (selectedVehicleKey.value = s.vehicle.key)}
    >
```

- [ ] **Step 4: Run the table tests to verify they pass**

Run: `npx vitest run test/ui/ScenarioTable.test.tsx`
Expected: PASS (all tests, including the original four).

- [ ] **Step 5: Swap Hero → CarFocus in App, delete Hero**

In `src/ui/App.tsx`, replace the Hero import (line 4):

```tsx
import { Hero } from './components/Hero';
```

with:

```tsx
import { CarFocus } from './components/CarFocus';
```

and replace `<Hero />` (line 29) with:

```tsx
        <CarFocus />
```

Then delete the now-unused file:

```bash
git rm src/ui/components/Hero.tsx
```

- [ ] **Step 6: Add mesh attribution + disclaimer to the footer**

In `src/ui/components/Footer.tsx`, add the import at the top:

```ts
import { MODEL_ASSETS } from '@data/models3d';
```

Add this component above `export function Footer()`:

```tsx
/** CC-BY mesh credits (when present) + the non-affiliation disclaimer. */
function MeshCredit() {
  const credits = [
    ...new Set(
      Object.values(MODEL_ASSETS)
        .map((a) => a.attribution)
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
        .map((a) => `${a.author} (${a.license})`),
    ),
  ];
  return (
    <div style={{ marginTop: '8px' }}>
      {credits.length > 0 && <>3D models: {credits.join(' · ')}. </>}
      Not affiliated with or endorsed by Tesla, Inc.
    </div>
  );
}
```

Then render `<MeshCredit />` just before the closing `</div>` of **both** the `id === 'US'` return and the default return (i.e. immediately after the snapshot sentence in each `<div class="foot" id="foot">`).

- [ ] **Step 7: Run the full suite + typecheck**

Run: `npx vitest run && npm run typecheck`
Expected: all tests PASS; `tsc --noEmit` clean (no unused `Hero`, custom element typed).

- [ ] **Step 8: Commit**

```bash
git add src/ui/App.tsx src/ui/components/ScenarioTable.tsx src/ui/components/Footer.tsx test/ui/ScenarioTable.test.tsx
git commit -m "feat: focus panel replaces hero; table click-to-select; footer attribution"
```

---

## Task 7: Source + place the 3D assets (manual)

> No automated test — this task delivers binary assets. Acceptance is verified visually in `npm run dev` and via `npm run build`. The code already references `public/models/{model3,modely}.{glb,webp}`; until the files exist the viewer shows a broken poster but the suite stays green.

**Files:**
- Create: `public/models/model3.glb`, `public/models/modely.glb`
- Create: `public/models/model3.webp`, `public/models/modely.webp`
- Modify: `src/data/models3d.ts` (fill `attribution`)

- [ ] **Step 1: Create the directory**

```bash
mkdir -p public/models
```

- [ ] **Step 2: Source a low-poly Model 3 GLB (CC-BY)**

Find a low-poly Model 3 on Sketchfab filtered to **Downloadable + CC Attribution** (the spec notes a clean ~4.3k-tri CC-BY mesh exists). Confirm the license reads "CC Attribution" (not NonCommercial, not "Editorial use only"). Download the GLB (or glTF; convert to GLB). Record author name + model URL + exact license string for attribution.

- [ ] **Step 3: Source a low-poly Model Y GLB (CC-BY), or fall back**

Per the spec, a clean CC-BY web-weight Model Y may not exist. In order of preference: (a) a CC-BY low-poly Model Y; (b) a CC-BY generic low-poly compact SUV/crossover used as a stand-in; (c) decimate a heavier CC-BY Model Y in Blender to < ~30k tris. Record the same attribution fields.

- [ ] **Step 4: Prep each mesh in Blender**

For each GLB: remove any Tesla "T" badge mesh/logo texture (de-badge); ensure the car body is a **single material** whose name matches `/body|paint|car|exterior/i` (rename if needed) so `CarViewer`'s recolor finds it; center the model at the origin and face it 3/4 forward. Export as GLB (`model3.glb` / `modely.glb`) into `public/models/`.

- [ ] **Step 5: Optimize the GLB**

```bash
npx @gltf-transform/cli optimize public/models/model3.glb public/models/model3.glb --compress draco --texture-compress webp
npx @gltf-transform/cli optimize public/models/modely.glb public/models/modely.glb --compress draco --texture-compress webp
```

Target a few hundred KB or less per file. (Draco-compressed GLBs decode fine in model-viewer.)

- [ ] **Step 6: Generate posters**

Run `npm run dev`, open the focus panel, let each car load, and capture a poster: in the browser console for the `<model-viewer>` element, `el.toBlob({mimeType:'image/webp'})` and save as `model3.webp` / `modely.webp` into `public/models/`. (Alternatively a clean offscreen render.) These are the instant-paint stand-ins.

- [ ] **Step 7: Fill attribution**

In `src/data/models3d.ts`, add the real `attribution` to each `MODEL_ASSETS` entry, e.g.:

```ts
  'Model 3': {
    glb: `${BASE}models/model3.glb`,
    poster: `${BASE}models/model3.webp`,
    attribution: { author: '<author>', url: '<model-url>', license: 'CC-BY 4.0' },
  },
```

- [ ] **Step 8: Verify + commit**

Run: `npm run dev` — confirm both cars load, spin, and recolor on swatch click; confirm the footer lists the credits.

```bash
git add public/models src/data/models3d.ts
git commit -m "feat: add low-poly Model 3 + Model Y assets with attribution"
```

---

## Task 8: Final verification

**Files:** none (verification + final commit if anything was left uncommitted)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all suites PASS (new state/resolver/component tests + existing golden + ScenarioTable tests).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `tsc --noEmit` clean; Vite build succeeds; output shows a **separate chunk** for `@google/model-viewer` (lazy import) — it must not be in the main entry chunk.

- [ ] **Step 3: Manual smoke (dev)**

Run: `npm run dev` and verify:
- Selecting any model + trim updates the car, the name, and the four numbers.
- The four numbers for the selected trim **match that trim's row** in the table below (same engine).
- Clicking a table row updates the focus panel; the selected row is highlighted.
- Paint swatches recolor the car body.
- Switching market (CA ↔ US) resets the selection to the new lineup's first trim.
- With OS "reduce motion" on, the car does not auto-rotate.
- Footer shows the CC-BY credit + "Not affiliated with or endorsed by Tesla, Inc."

- [ ] **Step 4: Commit anything outstanding**

```bash
git status
# commit any stragglers; the feature work should already be committed per task
```

---

## Spec coverage check

| Spec item | Task |
| --- | --- |
| `selectedVehicleKey` + `selectedScenario`, reset on `setMarket` | 1 |
| `MODEL_ASSETS` keyed by family + `assetFor()` resolution | 2 |
| Optional per-trim `glb?`/`poster?` on `Vehicle` | 2 |
| `TrimSelector` (model toggle + trim chips) | 3 |
| `CarViewer`: lazy chunk, poster-first, reduced-motion, recolor, failure fallback | 4 |
| `CarFocus` with cost summary + paint swatches | 5 |
| App: `Hero` → `CarFocus`; keep `Takeaways` | 6 |
| `ScenarioTable` highlight + click-to-select (bidirectional) | 6 |
| Footer CC-BY attribution + non-affiliation disclaimer | 6 |
| Low-poly Model 3 + Model Y assets, de-badged, body material for recolor | 7 |
| `npm test` green + `npm run build` clean; lazy 3D chunk off critical path | 8 |
| **Deferred (YAGNI):** per-trim wheels, chart highlight, AR/USDZ, multi-colour persistence | — (out of scope, per spec) |

---

## Implementation status (2026-06-23) — shipped with placeholder art

Tasks 1–6 + 8 landed fully (state, selector, viewer, panel, table sync, footer,
styling); **94 tests green, `tsc` + `vite build` clean**. Task 7 shipped the
*frame* with a **placeholder mesh**, with the real Tesla art intentionally
deferred (user decision: "ship the frame, fill in the actual three.js a bit
later").

**Open follow-ups** (none block the merged feature):

1. **Real low-poly meshes.** `public/models/{model3,modely}.glb` are currently the
   three.js Ferrari demo asset (a real car, so the viewer/recolor/swap are
   demonstrably working). Replace with clean low-poly **Model 3** (a CC-BY mesh
   exists) and **Model Y** (the hard one — no clean CC-BY web-weight mesh per D4;
   source/de-badge/decimate, or a generic low-poly SUV). Swap is **data-only**:
   drop the GLB in `public/models/`, point the URL in `src/data/models3d.ts`
   (`MODEL_ASSETS`), and update `attribution`. Ensure the body is its own material
   matching `/body|paint|car|exterior/i` so paint recolor binds (Ferrari uses
   `Body_Color`). Posters: `public/models/{model3,modely}.svg` are placeholder
   silhouettes — regenerate from the real mesh.
2. **model-viewer bundle weight.** The lazy chunk is **298 KB gzip** (full three.js
   via npm), not the 71 KB the spec cited for model-viewer's optimized CDN build.
   It is off the critical path (lazy, behind a poster), but worth trimming — e.g.
   load model-viewer's prebuilt CDN module, or `manualChunks`/externalize three.

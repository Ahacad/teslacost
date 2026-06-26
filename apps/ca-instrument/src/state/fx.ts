import { rates } from './settings';

const FX_URL = 'https://open.er-api.com/v6/latest/CAD';

export const fxUpdated = { value: '' };

/**
 * Pull live mid-market rates (units per CAD) from open.er-api.com — no key, CORS
 * enabled. On any failure we keep the baked fallback rates, so the page works
 * offline / from file://.
 */
export async function loadFx(): Promise<void> {
  try {
    const res = await fetch(FX_URL, { cache: 'no-store' });
    const json = await res.json();
    if (json && json.rates && typeof json.rates.USD === 'number') {
      rates.value = { ...rates.value, ...json.rates, CAD: 1 };
      if (typeof json.time_last_update_utc === 'string') {
        fxUpdated.value = json.time_last_update_utc;
      }
    }
  } catch {
    // keep fallback rates
  }
}

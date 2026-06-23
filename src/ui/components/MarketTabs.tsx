import { marketId, setMarket, MARKETS } from '@state/settings';
import { Flag } from './Flag';

/** Top-level market switch (Canada / US). Swaps the whole dashboard's data. */
export function MarketTabs() {
  return (
    <div class="mtabs reveal" role="tablist" aria-label="Market">
      {MARKETS.map((m) => (
        <button
          type="button"
          role="tab"
          aria-selected={marketId.value === m.id}
          class={`mtab${marketId.value === m.id ? ' on' : ''}`}
          onClick={() => setMarket(m.id)}
        >
          <Flag code={m.id} class="mtab-flag" />
          {m.label}
        </button>
      ))}
    </div>
  );
}

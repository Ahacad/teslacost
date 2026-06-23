import { marketId, setMarket, MARKETS } from '@state/settings';

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
          <span class="flag">{m.flag}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

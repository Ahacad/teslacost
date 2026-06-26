# @teslacost/cost-model

US (Seattle) EV-switch cost model — keep the 2025 Kia vs seven EV "possible worlds" (new/used Model Y at several rates, Ioniq 5 buy/lease, a PHEV) over time: net cost, break-even vs the Kia, and walk-away-whole, with every load-bearing assumption exposed as a slider.

Composited from the write-ups in [`analyses/`](analyses) (web-sourced + adversarially verified). Modularized from a single validated HTML file; the build reproduces that artifact's numbers to the dollar (locked by `test/`).

## Develop

```bash
pnpm --filter @teslacost/cost-model dev      # vite dev server
pnpm --filter @teslacost/cost-model test     # vitest — finance pinned to the cent
pnpm --filter @teslacost/cost-model build    # one self-contained dist/index.html
```

## Layout

- `src/domain/` — pure finance math (amortization, present value, equity, break-even). DOM-free, node-tested.
- `src/data/worlds.ts` — the eight worlds + WA-tax / trade-in / mpg constants.
- `src/ui/` — hand-rendered SVG chart, table, worked example, control wiring.
- `test/domain/finance.test.ts` — locks the table, verdict, and milestones to the validated figures.

The build is a single inlined `index.html` (via `vite-plugin-singlefile`) — copy it anywhere and it runs from `file://`.

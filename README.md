# teslacost

Monorepo of Tesla cost tooling.

## Apps

| Package | What | Live |
| --- | --- | --- |
| [`apps/ca-instrument`](apps/ca-instrument) | Canada finance/lease/cash cost instrument for Model 3 / Model Y — reproduces tesla.com's finance/lease math to the dollar | `…/teslacost/ca-instrument/` |
| [`apps/cost-model`](apps/cost-model) | US (Seattle) EV-switch cost model — keep-the-Kia vs seven EV "possible worlds" over time, net cost + break-even | `…/teslacost/cost-model/` |

## Develop

```bash
pnpm install
pnpm dev          # turbo runs every app's dev server
pnpm test         # turbo runs every app's tests
pnpm build        # turbo builds every app
pnpm --filter @teslacost/cost-model dev   # work on one app
```

Tooling: [pnpm workspaces](https://pnpm.io/workspaces) + [turborepo](https://turbo.build). Each app is a Vite + TypeScript package with its own Vitest suite.

## Deploy

Pushing to `master` builds both apps and publishes them to GitHub Pages under subpaths via `.github/workflows/deploy.yml`:

- `…/teslacost/` — landing page
- `…/teslacost/ca-instrument/`
- `…/teslacost/cost-model/`

import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@domain': r('./src/domain'),
      '@data': r('./src/data'),
      '@state': r('./src/state'),
      '@ui': r('./src/ui'),
    },
  },
  test: {
    globals: true,
    // Domain tests are pure (node); component tests opt into jsdom via a
    // `// @vitest-environment jsdom` pragma at the top of the file.
    environment: 'node',
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'] },
  },
});

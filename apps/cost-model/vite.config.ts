import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Relative base + single-file output → the build is one self-contained
  // index.html that works from any hosting subpath or file://.
  base: './',
  plugins: [viteSingleFile()],
  test: {
    globals: true,
    // Domain math is pure — no DOM needed.
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/domain/**', 'src/data/**'] },
  },
});

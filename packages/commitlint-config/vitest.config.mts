import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  cacheDir: '../../node_modules/.vite/packages/commitlint-config',
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/commitlint-config',
      provider: 'v8',
      enabled: true,
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
      include: ['commitlint-config.js'],
    },
  },
});

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  cacheDir: '../../node_modules/.vitest/packages/secretlint-config',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/secretlint-config',
      provider: 'v8',
      enabled: true,
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
      include: ['secretlint-config.json'],
    },
  },
});

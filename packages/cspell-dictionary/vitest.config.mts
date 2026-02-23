import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  cacheDir: '../../node_modules/.vitest/packages/cspell-dictionary',
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/cspell-dictionary',
      provider: 'v8',
      enabled: true,
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
      include: ['cspell.json'],
    },
  },
});

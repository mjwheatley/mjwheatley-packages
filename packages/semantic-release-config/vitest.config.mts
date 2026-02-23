import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vitest/packages/semantic-release-config',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/semantic-release-config',
      provider: 'v8',
      enabled: true,
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
      include: ['src/*.ts'],
      exclude: ['src/*.test.ts'],
    },
  },
});

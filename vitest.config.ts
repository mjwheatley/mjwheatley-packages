import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
      include: ['packages/**/*'],
      exclude: [
        '.nx',
        'node_modules',
        'dist',
        'coverage',
        'vitest.config.ts',
        'vitest.workspace.ts',
        'commitlint.config.mjs',
        'lint-staged.config.mjs',
      ],
    },
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'lint-staged.config.mjs', 'commitlint.config.mjs'],
    reporters: ['default', 'json'],
  },
});

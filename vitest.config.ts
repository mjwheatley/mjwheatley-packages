import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
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
    exclude: ['node_modules', 'dist', 'lint-staged.config.mjs', 'commitlint.config.mjs'],
    reporters: ['default', 'json'],
  },
});

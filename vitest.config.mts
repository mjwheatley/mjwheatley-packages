import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html', 'lcov'],
      include: ['packages/**/*'],
      exclude: [
        '.nx',
        'node_modules',
        'dist',
        'coverage',
        'vitest.config.mts',
        'vitest.workspace.ts',
        'commitlint.config.mjs',
        'lint-staged.config.mjs',
        '**/.sst',
      ],
    },
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'lint-staged.config.mjs', 'commitlint.config.mjs'],
    reporters: process.env['CI'] === 'true' ? ['default', 'json'] : [],
    projects: ['packages/*'],
  },
});

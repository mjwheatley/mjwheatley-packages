import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html', 'lcov'],
      include: ['{apps,libs,packages}/**/*'],
      exclude: [
        '.nx',
        'node_modules',
        'dist',
        '**/dist/**/*',
        'coverage',
        '**/coverage/**/*',
        '.secretlintrc.cjs',
        'commitlint.config.mjs',
        'eslint.config.mjs',
        'lint-staged.config.mjs',
        'vitest.config.mts',
        'vitest.workspace.ts',
        '**/.sst',
      ],
    },
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [...configDefaults.exclude, 'lint-staged.config.mjs', 'commitlint.config.mjs'],
    reporters:
      process.env['CI'] === 'true'
        ? [
            'default',
            'json',
            [
              'vitest-sonar-reporter',
              {
                outputFile: './sonar-report.xml',
              },
            ],
          ]
        : [],
    projects: ['packages/*'],
  },
});

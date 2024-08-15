import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['json-summary', 'json', 'html'],
    },
    reporters: ['default', 'json'],
  },
});

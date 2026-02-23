import { defineConfig } from 'vitest/config';

import { getDirName, getVitestConfig } from './src/vitest-config.js';

const sharedVitestConfig = getVitestConfig({
  nxProjectRoot: 'packages/nx-vitest-config',
  configDir: getDirName(import.meta.url),
  isLib: true,
});

const vitestConfig: ReturnType<typeof getVitestConfig> = {
  ...sharedVitestConfig,
};

export default defineConfig(vitestConfig);

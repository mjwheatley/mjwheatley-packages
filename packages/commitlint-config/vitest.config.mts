import { getDirName, getVitestConfig } from '@mjwheatley/nx-vitest-config';
import { defineConfig } from 'vitest/config';

const sharedVitestConfig = getVitestConfig({
  nxProjectRoot: 'packages/commitlint-config',
  configDir: getDirName(import.meta.url),
  isLib: true,
});

const vitestConfig: ReturnType<typeof getVitestConfig> = {
  ...sharedVitestConfig,
};

export default defineConfig(vitestConfig);

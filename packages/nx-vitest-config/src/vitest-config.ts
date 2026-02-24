import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { type ViteUserConfig, defineConfig as vitestDefineConfig } from 'vitest/config';

export const getDirName = (path: string): string => dirname(fileURLToPath(path));

export const getProjectRoot = ({ cwd }: { cwd: string }): string => {
  const parts = cwd.split('/');

  return join(parts.at(-2) ?? '', parts.at(-1) ?? '');
};

export type CustomViteUserConfig = Omit<ViteUserConfig, 'test' | 'plugins'> &
  Required<Pick<ViteUserConfig, 'test' | 'plugins'>>;

export const getVitestReporters = ({
  nxProjectRoot,
}: {
  nxProjectRoot: string;
}): CustomViteUserConfig['test']['reporters'] => {
  return [
    'default',
    [
      'vitest-sonar-reporter',
      {
        outputFile: `../../coverage/${nxProjectRoot}/sonar-report.xml`,
        onWritePath(path: string) {
          return `${nxProjectRoot}/${path}`;
        },
      },
    ],
  ];
};

export const getVitestCoverageReporters = (): string[] => ['json-summary', 'json', 'html', 'lcov'];

export const getVitestCoverageConfig = ({
  nxProjectRoot,
  isLib,
}: {
  nxProjectRoot: string;
  isLib?: boolean;
}): CustomViteUserConfig['test']['coverage'] => ({
  reportsDirectory: `../../coverage/${nxProjectRoot}`,
  provider: 'v8',
  enabled: true,
  reportOnFailure: true,
  reporter: getVitestCoverageReporters(),
  include: [
    isLib ? 'src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}' : '{packages,stacks}/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  ],
});

export const getCommonVitestPlugins = (): CustomViteUserConfig['plugins'] => [
  nxViteTsPaths(),
  nxCopyAssetsPlugin(['*.md']),
];

export const getVitestCacheDir = (nxProjectRoot: string): string => `../../node_modules/.vitest/${nxProjectRoot}`;

export const getBaseVitestTestConfig = (): {
  silent: 'passed-only';
  watch: boolean;
  globals: boolean;
  environment: string;
} => ({
  silent: 'passed-only',
  watch: false,
  globals: true,
  environment: 'node',
});

export const getCommonVitestTestConfig = ({
  nxProjectRoot,
  isLib,
}: {
  nxProjectRoot: string;
  isLib?: boolean;
}): CustomViteUserConfig['test'] => ({
  ...getBaseVitestTestConfig(),
  globalSetup: resolve(import.meta.dirname, './globalSetup.js'),
  reporters: getVitestReporters({ nxProjectRoot }),
  coverage: getVitestCoverageConfig({ nxProjectRoot, isLib }),
  include: [
    isLib
      ? 'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
      : '{packages,stacks}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  ],
});

export const getVitestConfig = ({
  nxProjectRoot,
  configDir,
  isLib,
}: {
  nxProjectRoot: string;
  configDir: string;
  isLib?: boolean;
}): CustomViteUserConfig => {
  return {
    root: configDir,
    cacheDir: getVitestCacheDir(nxProjectRoot),
    plugins: getCommonVitestPlugins(),
    test: getCommonVitestTestConfig({ nxProjectRoot, isLib }),
  };
};

export const defineConfig = ({
  nxProjectRoot,
  configDir,
}: {
  nxProjectRoot: string;
  configDir: string;
}): ReturnType<typeof vitestDefineConfig> => vitestDefineConfig(getVitestConfig({ nxProjectRoot, configDir }));

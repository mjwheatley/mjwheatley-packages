import type { Options, PluginSpec } from 'semantic-release';

export const commitAnalyzerPlugin = [
  '@semantic-release/commit-analyzer',
  {
    releaseRules: [
      { type: 'chore', scope: 'deps', release: 'minor' },
      { type: 'chore', scope: 'deps-dev', release: false },
      { type: 'docs', scope: 'README', release: 'patch' },
      { type: 'refactor', release: 'patch' },
      { type: 'build', scope: 'output', release: 'patch' },
      { scope: 'patch', release: 'patch' },
      { scope: 'no-release', release: false },
    ],
  },
] satisfies PluginSpec;

export const releaseNotesGeneratorPlugin = [
  '@semantic-release/release-notes-generator',
  {
    presetConfig: {
      types: [
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'perf', section: 'Performance Improvements' },
        { type: 'revert', section: 'Reverts' },
        { type: 'docs', section: 'Documentation' },
        { type: 'style', section: 'Styles' },
        { type: 'chore', section: 'Miscellaneous Chores' },
        { type: 'refactor', section: 'Code Refactoring' },
        { type: 'test', section: 'Tests' },
        { type: 'build', section: 'Build System' },
        { type: 'ci', section: 'Continuous Integration' },
      ],
    },
  },
] satisfies PluginSpec;

const config = {
  preset: 'conventionalcommits',
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    'next-major',
    {
      name: 'beta',
      prerelease: true,
    },
    {
      name: 'alpha',
      prerelease: true,
    },
  ],
  plugins: [
    commitAnalyzerPlugin,
    releaseNotesGeneratorPlugin,
    '@semantic-release/npm',
    '@semantic-release/github',
    'semantic-release-lifecycles',
  ],
} satisfies Options;

export default config;

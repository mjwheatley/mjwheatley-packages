module.exports = {
  repositoryUrl: 'https://github.com/mjwheatley/nx-monorepo',
  github: true,
  changelog: false,
  npm: true,
  /* eslint-disable-next-line no-template-curly-in-string */
  tagFormat: '${PROJECT_NAME}-v${VERSION}',
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
  preset: 'conventionalcommits',
  releaseRules: [
    { type: 'docs', scope: 'README', release: 'patch' },
    { type: 'refactor', release: 'patch' },
    { type: 'build', scope: 'output', release: 'patch' },
    { scope: 'patch', release: 'patch' },
    { scope: 'no-release', release: false },
  ],
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
};

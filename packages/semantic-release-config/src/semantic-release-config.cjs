const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const finalizeContext = (context) => {
  for (const commitGroup of context.commitGroups) {
    for (const commit of commitGroup.commits) {
      commit.bodyLines = commit.body?.split('\n').filter((line) => line !== '') ?? [];
    }
  }

  return context;
};

const commitAnalyzerPlugin = [
  '@semantic-release/commit-analyzer',
  {
    releaseRules: [
      { type: 'docs', scope: 'README', release: 'patch' },
      { type: 'refactor', release: 'patch' },
      { type: 'build', scope: 'output', release: 'patch' },
      { scope: 'patch', release: 'patch' },
      { scope: 'no-release', release: false },
    ],
  },
];

const releaseNotesGeneratorPlugin = [
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
    writerOpts: {
      commitPartial: readFileSync(join(__dirname, 'commit.hbs'), 'utf-8'),
      finalizeContext,
    },
  },
];

const plugins = [
  commitAnalyzerPlugin,
  releaseNotesGeneratorPlugin,
  '@semantic-release/npm',
  '@semantic-release/github',
];

const branches = [
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
];

const preset = 'conventionalcommits';

module.exports = {
  commitAnalyzerPlugin,
  releaseNotesGeneratorPlugin,
  plugins,
  branches,
  preset,
};

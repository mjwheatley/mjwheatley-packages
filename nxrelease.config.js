const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const finalizeContext = (context) => {
  for (const commitGroup of context.commitGroups) {
    for (const commit of commitGroup.commits) {
      commit.bodyLines =
        commit.body?.split("\n").filter((line) => line !== "") ?? [];
    }
  }

  return context;
};

module.exports = {
  dryRun: true,
  repositoryUrl: "https://github.com/mjwheatley/nx-monorepo",
  github: true,
  changelog: false,
  npm: true,
  /* eslint-disable-next-line no-template-curly-in-string */
  tagFormat: "${PROJECT_NAME}-v${VERSION}",
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "main",
    "next",
    "next-major",
    {
      name: "beta",
      prerelease: true,
    },
    {
      name: "alpha",
      prerelease: true,
    },
  ],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "docs", scope: "README", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "build", scope: "output", release: "patch" },
          { scope: "patch", release: "patch" },
          { scope: "no-release", release: false },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "Features" },
            { type: "fix", section: "Bug Fixes" },
            { type: "perf", section: "Performance Improvements" },
            { type: "revert", section: "Reverts" },
            { type: "docs", section: "Documentation" },
            { type: "style", section: "Styles" },
            { type: "chore", section: "Miscellaneous Chores" },
            { type: "refactor", section: "Code Refactoring" },
            { type: "test", section: "Tests" },
            { type: "build", section: "Build System" },
            { type: "ci", section: "Continuous Integration" },
          ],
        },
        writerOpts: {
          commitPartial: readFileSync(join(__dirname, "commit.hbs"), "utf-8"),
          finalizeContext,
        },
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};

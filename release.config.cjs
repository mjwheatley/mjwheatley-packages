const { branches, plugins, preset } = require('@mjwheatley/semantic-release-config');

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  extends: 'semantic-release-monorepo',
  branches,
  preset,
  plugins,
};

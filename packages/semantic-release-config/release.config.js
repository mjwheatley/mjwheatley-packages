const { branches, plugins, preset } = require('./src/semantic-release-config.cjs');
const name = 'semantic-release-config';
const srcRoot = `packages/${name}`;

module.exports = {
  pkgRoot: srcRoot,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  branches,
  preset,
};

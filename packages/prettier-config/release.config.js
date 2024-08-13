const { preset, plugins } = require('@mjwheatley/semantic-release-config');
const name = 'prettier-config';
const srcRoot = `packages/${name}`;

module.exports = {
  pkgRoot: srcRoot,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  preset,
  plugins,
};

const { preset, plugins } = require('@mjwheatley/semantic-release-config');
const name = 'package-one';
const srcRoot = `packages/${name}`;

module.exports = {
  pkgRoot: srcRoot,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  preset,
  plugins,
};

const { branches, plugins, preset } = require('@mjwheatley/semantic-release-config');
const name = 'cspell-dictionary';
const srcRoot = `packages/${name}`;

module.exports = {
  pkgRoot: srcRoot,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  branches,
  preset,
  plugins,
};

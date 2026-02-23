# semantic-release-config

This package exports customized plugins and other configurations for [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

## Installation

```bash
pnpm i -D -w @mjwheatley/semantic-release-config semantic-release
```

## Usage

Create a `release.config.mjs` file at the root of your project with the following content:

```javascript
import { branches, plugins, preset } from '@mjwheatley/semantic-release-config';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  /* eslint-disable-next-line no-template-curly-in-string */
  tagFormat: 'v${version}',
  branches,
  preset,
  plugins,
};
```

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build semantic-release-config` to build the library.

## Running unit tests

Run `nx test semantic-release-config` to execute the unit tests via [Vitest](https://vitest.dev/).

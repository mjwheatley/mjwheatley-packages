# secretlint-config

This package provides secretlint rules for the organization.

## Installation

Install the package as a development dependency at the root of your workspace

```bash
pnpm i -D -w @mjwheatley/secretlint-config secretlint
```

## Usage

Create a `.secretlintrc.cjs` file at the root of your workspace with the following content:

```js
const { rules } = require('@mjwheatley/secretlint-config');

module.exports = {
  rules: [...rules],
};
```

Add a script to your `package.json` to run secretlint

```json
{
  "scripts": {
    "secretlint": "secretlint . --maskSecrets"
  }
}
```

Update your `lint-staged.config.mjs` file to run secretlint

```js
export default {
  '*': (files) => [`secretlint ${files.join(' ')}`],
};
```

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build secretlint-config` to build the library.

## Running unit tests

Run `nx test secretlint-config` to execute the unit tests via [Vitest](https://vitest.dev/).

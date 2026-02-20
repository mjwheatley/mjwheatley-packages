# prettier-config

This package provides a shared Prettier configuration.

## Installation

```bash
pnpm i -D -w prettier @mjwheatley/prettier-config
```

## Usage

**Simple**: Add prettier to your `package.json`:

```json
{
  "prettier": "@mjwheatley/prettier-config"
}
```

**Custom**: Create a `prettier.config.mjs` file at the root of your project with the following content:

```javascript
import prettierConfig from '@mjwheatley/prettier-config';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  ...prettierConfig,
};

export default config;
```

This approach allows you to extend the shared configuration with your own customizations.

### Prettier Ignore

Create a `.prettierignore` file at the root of your project with the following content:

```
/dist
/coverage
pnpm-lock.yaml
```

## Run

Add a `format` script to your `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write ."
  }
}
```

Update your lint-staged configuration to run `prettier` on all files:

```javascript
export default {
  '*': (files) => [`prettier --write --ignore-unknown ${files.join(' ')}`],
};
```

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build prettier-config` to build the library.

## Running unit tests

Run `nx test prettier-config` to execute the unit tests via [Vitest](https://vitest.dev/).

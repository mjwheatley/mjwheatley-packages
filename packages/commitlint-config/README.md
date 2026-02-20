# commitlint-config

This package provides a shared commitlint configuration.

The configuration is based on the [Conventional Commits](https://www.conventionalcommits.org/) specification. The configuration will also spellcheck the commit messages using the [commitlint-plugin-cspell](https://www.npmjs.com/package/commitlint-plugin-cspell) plugin.

## Installation

```bash
pnpm i -D -w @mjwheatley/commitlint-config commitlint
```

## Usage

Create a `commitlint.config.mjs` file at the root of your project with the following content:

```javascript
/**
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@mjwheatley/commitlint-config'],
};
```

## Validate Setup

Verify a commit message must follow the Conventional Commits specification by running the following command:

```bash
echo "not a conventional commit" | npx --no commitlint
```

Verify a commit message is spellchecked by running the following command:

```bash
#/* cspell:disable-next-line */
echo "feat(speling): demo" | npx --no commitlint
```

## Git Hooks

We recommend using [Husky](https://typicode.github.io/husky) to enforce the commit message format and spellcheck the commit messages.

### Install Husky

```bash
npx husky init
```

Create a `commit-msg` file in the `.husky` directory with the following content:

```text
npx --no -- commitlint --edit $1
```

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build commitlint-config` to build the library.

## Running unit tests

Run `nx test commitlint-config` to execute the unit tests via [Vitest](https://vitest.dev/).

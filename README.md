# @mjwheatley/packages

A monorepo of shared tooling and configuration packages published under the `@mjwheatley` scope, managed with Nx and pnpm.

It includes reusable configs (commitlint, prettier, semantic-release, cspell), an Nx release helper, and example libraries.

## Local development

Please make sure you have [`Node.js`](https://nodejs.org/) and [`pnpm`](https://pnpm.io/) installed.

### Node.js

You can use either `fnm` or `nvm` to install the version of Node defined in our [`.nvmrc`](.nvmrc) file.

- [Fast Node Manager (fnm)](https://github.com/Schniz/fnm)
  - `brew install fnm`
  - `fnm use`
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
  - `brew install nvm`
  - `nvm use`

### PNPM

```sh
corepack enable
```

:information_source: If you already have `pnpm` installed via `brew` or `npm i -g`, you should remove those versions as they are not needed anymore. Corepack will handle installing the correct version for you.

:warning: If you get `command not found` when trying to run `corepack`, you probably didn't use `fnm`/`nvm` to install Node. The preferred fix is to use one of those tools to manage your installed Node versions. If you don't want to use them, you will need to install [`corepack`](https://github.com/nodejs/corepack) manually.

- `npm install -g corepack`

### Create a new package

Replace the `<package-name>` with the name of the package you want to create.

```text
 pnpm nx g lib packages/<package-name> --publishable --importPath @mjwheatley/<package-name>
```

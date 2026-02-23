# cspell-dictionary

This package contains dictionaries for the [cspell](https://www.npmjs.com/package/cspell) spell checker.

## Dictionaries

| Name                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| acronyms.txt          | Acronyms                                        |
| common-filenames.txt  | Common filenames                                |
| identifiers.txt       | Any identifier, such as a variable or parameter |
| packages.txt          | NPM package names                               |
| people.txt            | People's names                                  |
| places.txt            | Any place, such as a city, state, or country    |
| programming-terms.txt | Programming terms                               |
| things.txt            | Other things that might not fit elsewhere       |
| usernames.txt         | Usernames                                       |

## Installation

```bash
pnpm i -D -w @mjwheatley/cspell-dictionary
```

## Usage

Create a `cspell.json` file at the root of your project with the following content:

```json
{
  "version": "0.2",
  "import": ["@mjwheatley/cspell-dictionary"],
  "words": [],
  "ignorePaths": [
    "./private",
    ".github/CODEOWNERS",
    ".secretlintrc.cjs",
    ".vscode/*.json",
    "**/*.map",
    "**/dist/*",
    "node_modules/**",
    "pnpm-lock.yaml"
  ],
  "languageSettings": [
    {
      "languageId": "commit-msg",
      "ignoreRegExpList": ["/^#.*/gm"]
    }
  ]
}
```

Add a `spellcheck` script to your `package.json`:

```json
{
  "scripts": {
    "spellcheck": "cspell --no-progress \"./{.github,packages}/**/*.{md,js,mjs,cjs,ts,mts,cts,tsx,json,yml}\" \"./*.{md,js,mjs,cjs,ts,mts,cts,tsx,json}\""
  }
}
```

Run spellcheck in your as part of your `lint-staged` configuration:

```javascript
export default {
  '*.{js,cjs,mjs,ts,cts,mts,json,yml,yaml,md}': ['cspell lint --no-progress --no-summary --no-must-find-files'],
  '*': (files) => [
    // Spell check file names
    `sh -c 'echo "${files.join('\n')}" | cspell --show-context stdin'`,
  ],
};
```

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build cspell-dictionary` to build the library.

## Running unit tests

Run `nx test cspell-dictionary` to execute the unit tests via [Vitest](https://vitest.dev/).

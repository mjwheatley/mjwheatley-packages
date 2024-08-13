/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSameLine: false,
  bracketSpacing: true,
  arrowParens: 'always',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'never',
};

module.exports = config;

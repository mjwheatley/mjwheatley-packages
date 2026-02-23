import type { Config } from 'prettier';

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
} satisfies Config;

export default config;

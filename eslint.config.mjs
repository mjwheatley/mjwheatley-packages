import { createEslintConfig } from '@mjwheatley/eslint-config';

const config = [
  ...createEslintConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  // Add repo-specific overrides below
];

export default config;

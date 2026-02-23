import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';

export default tsEslint.config(
  {
    ignores: ['**/dist'],
  },
  eslint.configs.recommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    plugins: {
      '@nx': nx,
      import: importPlugin,
      unicorn: unicornPlugin,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
      },
      'import/resolver': {
        typescript: {
          project: ['tsconfig.json', 'apps/*/tsconfig.json', 'libs/*/tsconfig.json', 'packages/*/tsconfig.json'],
        },
        node: {
          project: ['tsconfig.json', 'apps/*/tsconfig.json', 'libs/*/tsconfig.json', 'packages/*/tsconfig.json'],
          extensions: ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'],
        },
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      'import/no-extraneous-dependencies': ['error'],
      'unicorn/prefer-node-protocol': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    ...tsEslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);

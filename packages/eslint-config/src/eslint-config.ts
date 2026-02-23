import eslint from '@eslint/js';
import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import unicornPlugin from 'eslint-plugin-unicorn';
import tsEslint from 'typescript-eslint';

import type { ConfigArray } from 'typescript-eslint';

export interface EslintConfigOptions {
  /** The root directory for tsconfig resolution. Usually `import.meta.dirname`. */
  tsconfigRootDir: string;
  /** Additional ignore patterns to merge with defaults. */
  ignores?: string[];
  /** Additional devDependency file patterns for `import-x/no-extraneous-dependencies`. */
  devDependencyPatterns?: string[];
}

const defaultIgnores = [
  '**/build',
  'apps/*/build',
  'libs/*/build',
  '**/coverage',
  '**/dist',
  '**/node_modules',
  '**/private',
  '**/tmp',
  '**/*.timestamp-*.mjs',
  '**/*.sst.config*.mjs',
  '**/vitest.config.mts.timestamp-*.mjs',
];

const defaultDevDependencyPatterns = [
  './bin/*',
  './combine-coverage-reports.mts',
  './lint-staged.config.mjs',
  '**/eslint.config.{js,mjs,cjs,ts,mts,cts}',
  '**/.storybook/*',
  '**/*.{bench,test,test-d}.{ts,tsx}',
  '**/*.stories.tsx',
  '**/mocks/*',
  '**/next.config.mjs',
  '**/sst.config.ts',
  '**/stacks/**/*',
  '**/tailwind.config.mjs',
  '**/test/**/*.ts',
  '**/tests/setup.{mts,ts}',
  '**/tests/utils.tsx',
  '**/mocks/**/*.{ts,tsx}',
  '**/{vite,vitest}.config.mts',
  '**/vitest.setup.mts',
];

export function createEslintConfig(options: EslintConfigOptions): ConfigArray {
  const { tsconfigRootDir, ignores = [], devDependencyPatterns = [] } = options;

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return tsEslint.config(
    {
      ignores: [...defaultIgnores, ...ignores],
    },
    eslint.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
    eslintConfigPrettier,
    {
      plugins: {
        '@nx': nx,
        'import-x': importPlugin,
        unicorn: unicornPlugin,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs', '**/*.mts', '**/*.cts'],
      languageOptions: {
        parser: tsEslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      settings: {
        'import-x/extensions': ['.ts', '.mts', '.cts', '.tsx', '.js', '.json'],
        'import-x/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
        },
        'import-x/resolver': {
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
        // @nx rules
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

        // @typescript-eslint rules
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        '@typescript-eslint/default-param-last': 'error',
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-deprecated': 'warn',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/unified-signatures': 'warn',

        // Core ESLint rules
        'default-param-last': 'off',
        'max-params': ['warn', 4],
        'no-use-before-define': 'off',
        'no-restricted-syntax': [
          'warn',
          {
            selector:
              "VariableDeclarator[id.typeAnnotation] > :matches(TSTypeAssertion, TSAsExpression) > TSTypeReference.typeAnnotation > Identifier[name='const']",
            message:
              "Don't use `as const` with an annotated variable. Use a type annotation, `satisfies`, or `as const satisfies` instead.",
          },
          {
            selector:
              "VariableDeclarator[id.typeAnnotation]  > TSSatisfiesExpression > TsAsExpression > TSTypeReference.typeAnnotation > Identifier[name='const']",
            message:
              "Don't use `as const satisfies` with an annotated variable. Use a type annotation or `as const satisfies`, but not both.",
          },
        ],
        'no-await-in-loop': 'warn',
        'no-constant-binary-expression': 'error',
        'no-promise-executor-return': 'error',
        'no-template-curly-in-string': 'error',
        'no-throw-literal': 'error',
        'object-shorthand': ['error', 'always'],
        'prefer-object-has-own': 'warn',
        'prefer-promise-reject-errors': 'error',
        'prefer-const': ['error', { destructuring: 'all' }],
        'no-restricted-imports': [
          'warn',
          {
            paths: [
              { name: '..', message: 'Please use full paths to imports' },
              { name: 'yup', message: 'Use Zod instead of Yup' },
              { name: 'lodash', message: 'Are you sure you should be using lodash?' },
            ],
            patterns: [{ group: ['lodash/*'], message: 'Are you sure you should be using lodash?' }],
          },
        ],
        'id-length': [
          'error',
          {
            exceptions: ['_', 'a', 'b', 'i', 'j'],
            min: 2,
            properties: 'never',
          },
        ],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', next: 'return', prev: '*' },
          { blankLine: 'always', next: 'throw', prev: '*' },
          { blankLine: 'always', next: 'export', prev: 'export' },
          { blankLine: 'always', next: '*', prev: ['const', 'let', 'var'] },
          { blankLine: 'any', next: ['const', 'let', 'var'], prev: ['const', 'let', 'var'] },
          { blankLine: 'always', next: '*', prev: 'directive' },
          { blankLine: 'any', next: 'directive', prev: 'directive' },
          { blankLine: 'always', next: 'if', prev: '*' },
          { blankLine: 'always', next: '*', prev: 'if' },
        ],

        // import-x rules
        'import-x/first': 'error',
        'import-x/no-absolute-path': 'error',
        'import-x/no-cycle': 'off',
        'import-x/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [...defaultDevDependencyPatterns, ...devDependencyPatterns],
          },
        ],
        'import-x/no-relative-packages': 'error',
        'import-x/no-self-import': 'error',
        'import-x/no-unresolved': 'error',
        'import-x/no-useless-path-segments': ['error', { noUselessIndex: false }],
        'import-x/order': [
          'error',
          {
            alphabetize: { order: 'asc', caseInsensitive: true },
            groups: ['builtin', 'external', 'internal', 'parent', ['sibling', 'index'], 'type'],
            'newlines-between': 'always',
          },
        ],
        'sort-imports': 'off',

        // unicorn rules
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/prefer-number-properties': ['warn', { checkInfinity: true, checkNaN: true }],
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
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      ...tsEslint.configs.disableTypeChecked,
      rules: {
        ...tsEslint.configs.disableTypeChecked.rules,
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/tests/**/*.ts', '**/tests/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
  );
}

export default createEslintConfig;

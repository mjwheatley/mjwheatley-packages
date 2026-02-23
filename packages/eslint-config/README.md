# eslint-config

This package provides a shareable ESLint flat config for TypeScript/JavaScript projects using ESLint 9+.

## Installation

```bash
pnpm i -D eslint @mjwheatley/eslint-config
```

## Usage

Create an `eslint.config.mjs` in your project root:

```javascript
import { createEslintConfig } from '@mjwheatley/eslint-config';

export default [
  ...createEslintConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
];
```

### Adding repo-specific overrides

Since `createEslintConfig` returns a flat config array, you can spread it and append additional config objects:

```javascript
import { createEslintConfig } from '@mjwheatley/eslint-config';

export default [
  ...createEslintConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  // Repo-specific overrides
  {
    rules: {
      'no-console': 'warn',
    },
  },
];
```

### Options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `tsconfigRootDir` | `string` | Yes | The root directory for tsconfig resolution. Usually `import.meta.dirname`. |
| `ignores` | `string[]` | No | Additional ignore patterns to merge with defaults. |
| `devDependencyPatterns` | `string[]` | No | Additional devDependency file patterns for `import-x/no-extraneous-dependencies`. |

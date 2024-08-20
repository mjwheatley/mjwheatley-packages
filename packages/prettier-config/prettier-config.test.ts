import { describe, expect, it } from 'vitest';
import config from './prettier-config.cjs';

describe('prettier-config', () => {
  it('should export a shared config', () => {
    expect(config).toEqual(
      expect.objectContaining({
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
      }),
    );
  });
});

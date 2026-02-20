import { describe, expect, it } from 'vitest';

import config from './prettier-config.js';

describe('prettier-config', () => {
  it('should export a shared config', () => {
    expect(config).toEqual(
      expect.objectContaining({
        printWidth: expect.any(Number),
        tabWidth: expect.any(Number),
        useTabs: expect.any(Boolean),
        semi: expect.any(Boolean),
        singleQuote: expect.any(Boolean),
        trailingComma: expect.any(String),
        bracketSameLine: expect.any(Boolean),
        bracketSpacing: expect.any(Boolean),
        arrowParens: expect.any(String),
        requirePragma: expect.any(Boolean),
        insertPragma: expect.any(Boolean),
        proseWrap: expect.any(String),
      }),
    );
  });
});

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { getProjectRoot } from './vitest-config.js';

describe('vitest.config.ts unit tests', () => {
  describe('getProjectRoot', () => {
    it('should return the project root', () => {
      expect(
        getProjectRoot({
          cwd: dirname(join(dirname(fileURLToPath(import.meta.url)), './')),
        }),
      ).toBe('packages/nx-vitest-config');
    });
  });
});

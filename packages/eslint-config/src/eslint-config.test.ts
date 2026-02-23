import { describe, expect, it } from 'vitest';

import { createEslintConfig } from './eslint-config.js';

describe('eslint-config', () => {
  it('should export createEslintConfig function', () => {
    expect(createEslintConfig).toBeTypeOf('function');
  });

  it('should return a config array', () => {
    const config = createEslintConfig({
      tsconfigRootDir: __dirname,
    });

    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  it('should merge additional ignores', () => {
    const config = createEslintConfig({
      tsconfigRootDir: __dirname,
      ignores: ['**/custom-ignore'],
    });

    const ignoresEntry = config.find((entry) => 'ignores' in entry && !('files' in entry));

    expect(ignoresEntry).toBeDefined();
    expect(ignoresEntry!.ignores).toContain('**/custom-ignore');
    expect(ignoresEntry!.ignores).toContain('**/dist');
  });

  it('should merge additional devDependency patterns', () => {
    const config = createEslintConfig({
      tsconfigRootDir: __dirname,
      devDependencyPatterns: ['**/custom-dev-pattern'],
    });

    const rulesEntry = config.find(
      (entry) => 'rules' in entry && entry.rules?.['import-x/no-extraneous-dependencies'] !== undefined,
    );

    expect(rulesEntry).toBeDefined();

    const rule = rulesEntry!.rules!['import-x/no-extraneous-dependencies'] as [string, { devDependencies: string[] }];

    expect(rule[1].devDependencies).toContain('**/custom-dev-pattern');
  });
});

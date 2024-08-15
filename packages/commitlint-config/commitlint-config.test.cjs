const { describe, expect, it } = require('vitest');
const commitlintConfig = require('./commitlint-config.cjs');

describe('commitlint-config', () => {
  it('should export a sharable commitlint configuration', () => {
    expect(commitlintConfig).toEqual(
      expect.objectContaining({
        extends: ['@commitlint/config-conventional'],
        plugins: ['commitlint-plugin-cspell'],
        rules: expect.objectContaining({
          'cspell/type': expect.any(Array),
          'cspell/scope': expect.any(Array),
          'cspell/subject': expect.any(Array),
          'cspell/body': expect.any(Array),
          'cspell/footer': expect.any(Array),
          'header-max-length': expect.any(Array),
          'body-max-line-length': expect.any(Array),
          'scope-case': expect.any(Array),
          'subject-empty': expect.any(Array),
          'subject-case': expect.any(Array),
          'type-case': expect.any(Array),
          'type-empty': expect.any(Array),
          'type-enum': expect.arrayContaining([2, 'always', expect.any(Array)]),
        }),
      }),
    );
  });
});

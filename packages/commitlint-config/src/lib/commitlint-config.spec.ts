import { commitlintConfig } from './commitlint-config';

describe('commitlintConfig', () => {
  it('should extend @commitlint/config-conventional and declare rules', () => {
    expect(commitlintConfig).toEqual(expect.objectContaining({
      extends: ['@commitlint/config-conventional'],
      rules: expect.objectContaining({
        'type-enum': [
          2,
          'always',
          [
            'feat',
            'fix',
            'docs',
            'style',
            'refactor',
            'perf',
            'test',
            'build',
            'ci',
            'chore',
            'revert',
          ],
        ]
      }),
    }));
  });
});

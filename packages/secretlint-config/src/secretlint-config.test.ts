import { describe, expect, it } from 'vitest';

import secretlintConfig from '../secretlint-config.json' with { type: 'json' };

describe('secretlint-config', () => {
  it('should contain rules', () => {
    expect(secretlintConfig).toEqual(expect.objectContaining({ rules: expect.any(Array) }));
    expect(secretlintConfig.rules.length).toBe(2);
  });

  it('has valid regular expressions', () => {
    const rulePatterns =
      secretlintConfig.rules
        .find((rule) => rule.id === '@secretlint/secretlint-rule-pattern')
        ?.options?.patterns.map((item) => item.pattern) ?? [];

    expect.assertions(2);

    for (const pattern of rulePatterns) {
      expect(() => new RegExp(pattern)).not.toThrow();
    }
  });
});

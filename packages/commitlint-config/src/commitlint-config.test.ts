/* Cspell:disable */
import lint from '@commitlint/lint';
import load from '@commitlint/load';
import { beforeAll, describe, expect, it } from 'vitest';

import commitlintConfig from './commitlint-config.js';

import type { LintOptions, LintOutcome, QualifiedRules } from '@commitlint/types';

let rules: QualifiedRules;
let lintOptions: LintOptions;

function lintMessage(message: string): Promise<LintOutcome> {
  return lint(message, rules, lintOptions);
}

describe('commitlint-config', () => {
  beforeAll(async () => {
    const loaded = await load(commitlintConfig);

    rules = loaded.rules;
    lintOptions = {
      parserOpts: loaded.parserPreset?.parserOpts as LintOptions['parserOpts'],
      plugins: loaded.plugins,
    };
  });

  describe('export', () => {
    it('should export a sharable commitlint configuration', () => {
      expect(commitlintConfig).toEqual(
        expect.objectContaining({
          extends: ['@commitlint/config-conventional'],
          plugins: expect.arrayContaining(['commitlint-plugin-cspell']),
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

  describe('rules', () => {
    describe('cspell/type', () => {
      it('should spellcheck commit message type', async () => {
        const result = await lintMessage('faet(commitlint-config): correct spelling');

        expect(result.valid).toBe(false);
        expect(result.errors.map((error) => error.message)).toEqual(
          expect.arrayContaining([expect.stringContaining('Spelling error found in type: faet')]),
        );
      });
    });

    describe('cspell/scope', () => {
      it('should spellcheck commit message scope', async () => {
        const result = await lintMessage('feat(commmitlint-config): correct spelling');

        expect(result.valid).toBe(false);
        expect(result.errors.map((error) => error.message)).toEqual(
          expect.arrayContaining([expect.stringContaining('Spelling error found in scope: commmitlint')]),
        );
      });
    });
  });

  describe('cspell/subject', () => {
    it('should spellcheck commit message subject', async () => {
      const result = await lintMessage('feat(commitlint-config): speling');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.message)).toEqual(
        expect.arrayContaining([expect.stringContaining('Spelling error found in subject: speling')]),
      );
    });
  });

  describe('cspell/body', () => {
    it('should spellcheck commit message body', async () => {
      const result = await lintMessage('feat(commitlint-config): correct spelling\n\ntypo in body speling');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.message)).toEqual(
        expect.arrayContaining([expect.stringContaining('Spelling error found in body: speling')]),
      );
    });
  });

  describe('cspell/footer', () => {
    it('should spellcheck commit message footer', async () => {
      const result = await lintMessage(
        'feat(commitlint-config): correct spelling\n\n\nBREAKING CHANGE: typo in footer speling',
      );

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.message)).toEqual(
        expect.arrayContaining([expect.stringContaining('Spelling error found in footer: speling')]),
      );
    });
  });

  describe('header-max-length', () => {
    it('should limit header length to 100 characters', async () => {
      const commitMessage =
        'feat(commitlint-config): commit message that exceeds maximum header length' + 'a'.repeat(100);
      const result = await lintMessage(commitMessage);

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('header-max-length');
    });
  });

  describe('body-max-line-length', () => {
    it('should limit body lines to 250 characters', async () => {
      const commitMessage = 'feat(commitlint-config): correct spelling\n\n' + 'a'.repeat(251);
      const result = await lintMessage(commitMessage);

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('body-max-line-length');
    });
  });

  describe('scope-case', () => {
    it('should limit scope to lowercase', async () => {
      const result = await lintMessage('feat(Commitlint-Config): correct spelling');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('scope-case');
    });
  });

  describe('subject-case', () => {
    it('should not allow subject to be sentence-case', async () => {
      const result = await lintMessage('feat(commitlint-config): Sentence case');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('subject-case');
    });

    it('should not allow subject to be start-case', async () => {
      const result = await lintMessage('feat(commitlint-config): Start Case');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('subject-case');
    });

    it('should not allow subject to be pascal-case', async () => {
      const result = await lintMessage('feat(commitlint-config): PascalCase');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('subject-case');
    });

    it('should not allow subject to be upper-case', async () => {
      const result = await lintMessage('feat(commitlint-config): UPPER CASE');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('subject-case');
    });
  });

  describe('type-case', () => {
    it('should require the type to be lower-case', async () => {
      const result = await lintMessage('Feat(commitlint-config): correct spelling');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('type-case');
    });
  });

  describe('type-empty', () => {
    it('should require a type', async () => {
      const result = await lintMessage('(commitlint-config): no type');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('type-empty');
    });
  });

  describe('type-enum', () => {
    it('should require a type from a predefined list', async () => {
      const result = await lintMessage('bugfix(commitlint-config): invalid type');

      expect(result.valid).toBe(false);
      expect(result.errors.map((error) => error.name)).toContain('type-enum');
    });
  });
});

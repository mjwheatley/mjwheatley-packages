/* Cspell:disable */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import commitlintConfig from './commitlint-config.js';

const execAsync = promisify(exec);

describe.sequential('commitlint-config', () => {
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
        const commitMessage = 'faet(commitlint-config): correct spelling';
        await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
          expect.objectContaining({
            stdout: expect.stringContaining('Spelling error found in type: faet'),
          }),
        );
      });
    });

    describe('cspell/scope', () => {
      it('should spellcheck commit message scope', async () => {
        const commitMessage = 'feat(commmitlint-config): correct spelling';
        await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
          expect.objectContaining({
            stdout: expect.stringContaining('Spelling error found in scope: commmitlint'),
          }),
        );
      });
    });
  });

  describe('cspell/subject', () => {
    it('should spellcheck commit message subject', async () => {
      const commitMessage = 'feat(commitlint-config): speling';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('Spelling error found in subject: speling'),
        }),
      );
    });
  });

  describe('cspell/body', () => {
    it('should spellcheck commit message body', async () => {
      const commitMessage = 'feat(commitlint-config): correct spelling\n\ntypo in body speling';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('Spelling error found in body: speling'),
        }),
      );
    });
  });

  describe('cspell/footer', () => {
    it('should spellcheck commit message footer', async () => {
      const commitMessage = 'feat(commitlint-config): correct spelling\n\n\nBREAKING CHANGE: typo in footer speling';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('Spelling error found in footer: speling'),
        }),
      );
    });
  });

  describe('header-max-length', () => {
    it('should limit header length to 100 characters', async () => {
      const commitMessage =
        'feat(commitlint-config): commit message that exceeds maximum header length' + 'a'.repeat(100);
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('header-max-length'),
        }),
      );
    });
  });

  describe('body-max-line-length', () => {
    it('should limit body lines to 250 characters', async () => {
      const commitMessage = 'feat(commitlint-config): correct spelling\n\n' + 'a'.repeat(251);
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('body-max-line-length'),
        }),
      );
    });
  });

  describe('scope-case', () => {
    it('should limit scope to lowercase', async () => {
      const commitMessage = 'feat(Commitlint-Config): correct spelling';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('scope-case'),
        }),
      );
    });
  });

  describe('subject-case', () => {
    it('should not allow subject to be sentence-case', async () => {
      const commitMessage = 'feat(commitlint-config): Sentence case';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('subject-case'),
        }),
      );
    });

    it('should not allow subject to be start-case', async () => {
      const commitMessage = 'feat(commitlint-config): Start Case';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('subject-case'),
        }),
      );
    });

    it('should not allow subject to be pascal-case', async () => {
      const commitMessage = 'feat(commitlint-config): PascalCase';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('subject-case'),
        }),
      );
    });

    it('should not allow subject to be upper-case', async () => {
      const commitMessage = 'feat(commitlint-config): UPPER CASE';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('subject-case'),
        }),
      );
    });
  });

  describe('type-case', () => {
    it('should require the type to be lower-case', async () => {
      const commitMessage = 'Feat(commitlint-config): correct spelling';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('type-case'),
        }),
      );
    });
  });

  describe('type-empty', () => {
    it('should require a type', async () => {
      const commitMessage = '(commitlint-config): no type';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('type-empty'),
        }),
      );
    });
  });

  describe('type-enum', () => {
    it('should require a type from a predefined list', async () => {
      const commitMessage = 'bugfix(commitlint-config): invalid type';
      await expect(execAsync(`echo "${commitMessage}" | npx --no commitlint`)).rejects.toEqual(
        expect.objectContaining({
          stdout: expect.stringContaining('type-enum'),
        }),
      );
    });
  });
});

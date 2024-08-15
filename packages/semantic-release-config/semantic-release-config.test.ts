import { describe, expect, it } from 'vitest';
import {
  branches,
  commitAnalyzerPlugin,
  finalizeContext,
  plugins,
  preset,
  releaseNotesGeneratorPlugin,
} from './semantic-release-config.cjs';

describe('semantic-release-config', () => {
  it('should export a custom configuration for @semantic-release/commit-analyzer', () => {
    expect(commitAnalyzerPlugin).toEqual(
      expect.objectContaining([
        '@semantic-release/commit-analyzer',
        expect.objectContaining({
          releaseRules: expect.any(Array),
        }),
      ]),
    );
  });
  it('should export a custom configuration for @semantic-release/release-notes-generator', () => {
    expect(releaseNotesGeneratorPlugin).toEqual(
      expect.objectContaining([
        '@semantic-release/release-notes-generator',
        expect.objectContaining({
          presetConfig: expect.objectContaining({
            types: expect.any(Array),
          }),
          writerOpts: expect.objectContaining({
            commitPartial: expect.any(String),
            finalizeContext: expect.any(Function),
          }),
        }),
      ]),
    );
  });
  it('should export a custom list of plugins', () => {
    expect(plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining([
          '@semantic-release/commit-analyzer',
          expect.objectContaining({
            releaseRules: expect.any(Array),
          }),
        ]),
        expect.objectContaining([
          '@semantic-release/release-notes-generator',
          expect.objectContaining({
            presetConfig: expect.objectContaining({
              types: expect.any(Array),
            }),
            writerOpts: expect.objectContaining({
              commitPartial: expect.any(String),
              finalizeContext: expect.any(Function),
            }),
          }),
        ]),
        '@semantic-release/npm',
        '@semantic-release/github',
      ]),
    );
  });
  it('should export a list of branches', () => {
    expect(branches).toEqual(
      expect.arrayContaining([
        '+([0-9])?(.{+([0-9]),x}).x',
        'main',
        'next',
        'next-major',
        expect.objectContaining({
          name: 'beta',
          prerelease: true,
        }),
      ]),
    );
  });
  it('should export a preset', () => {
    expect(preset).toBe('conventionalcommits');
  });

  describe('finalizeContext()', () => {
    it('should return an object with a "commits" property', () => {
      const context = {
        commitGroups: [
          {
            commits: [
              {
                body: 'commit-subject\n\ncommit-body',
              },
            ],
          },
        ],
      };
      const result = finalizeContext(context);
      expect(result).toEqual(
        expect.objectContaining({
          commitGroups: expect.arrayContaining([
            expect.objectContaining({
              commits: expect.arrayContaining([
                expect.objectContaining({
                  body: 'commit-subject\n\ncommit-body',
                  bodyLines: expect.any(Array),
                }),
              ]),
            }),
          ]),
        }),
      );
    });
  });
});

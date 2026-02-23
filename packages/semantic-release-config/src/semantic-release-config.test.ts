import { describe, expect, it } from 'vitest';

import config, { commitAnalyzerPlugin, releaseNotesGeneratorPlugin } from './semantic-release-config.js';

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
        }),
      ]),
    );
  });

  it('should export a custom list of plugins', () => {
    expect(config.plugins).toEqual(
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
          }),
        ]),
        '@semantic-release/npm',
        '@semantic-release/github',
      ]),
    );
  });

  it('should export a list of branches', () => {
    expect(config.branches).toEqual(
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
    expect(config.preset).toBe('conventionalcommits');
  });
});

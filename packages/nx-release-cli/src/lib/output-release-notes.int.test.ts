import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect } from 'vitest';

import { type OutputFormat, outputReleaseNotes } from './output-release-notes.js';

import type { NxReleaseChangelogResult } from 'nx/src/command-line/release/changelog.js';

const nxReleaseChangelogResult: NxReleaseChangelogResult = {
  projectChangelogs: {
    'prettier-config': {
      releaseVersion: {
        rawVersion: '0.0.1',
        gitTag: 'prettier-config-v0.0.1',
        isPrerelease: false,
      },
      contents:
        '## 0.0.1 (2024-08-19)\n\n\n### New Features\n\n- **prettier-config:** make prettier-config an Nx project ([f69eee6](https://github.com/team-and-tech/engineering-enablement/commit/f69eee6))\n\n\n### ❤️  Thank You\n\n- Matt Wheatley',
      postGitTask: null,
    },
  },
};

describe('outputReleaseNotes()', () => {
  it('should output the release notes', async () => {
    await expect(outputReleaseNotes(nxReleaseChangelogResult)).resolves.toBeUndefined();
    const filePath = join(process.cwd(), '.nx-release-output.json');
    const fileContents = await readFile(filePath, 'utf-8');
    const projectChangelogs: OutputFormat[] = JSON.parse(fileContents);

    expect(Array.isArray(projectChangelogs)).toBe(true);
    expect(projectChangelogs).toHaveLength(1);
    expect(projectChangelogs.at(0)).toEqual(
      expect.objectContaining({
        name: nxReleaseChangelogResult.projectChangelogs?.['prettier-config'].releaseVersion.gitTag,
        tag: nxReleaseChangelogResult.projectChangelogs?.['prettier-config'].releaseVersion.gitTag,
        notes: nxReleaseChangelogResult.projectChangelogs?.['prettier-config'].contents,
      }),
    );
  });
});

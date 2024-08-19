import { expect } from 'vitest';
import { outputReleaseNotes } from './output-release-notes.js';

const nxReleaseChangelogResult = {
  projectChangelogs: {
    'package-one': {
      releaseVersion: {
        rawVersion: '1.1.1',
        gitTag: '@mjwheatley/package-one-v1.1.1',
        isPrerelease: false,
      },
      contents:
        '## 1.1.1 (2024-08-19)\n\n\n### Bug Fixes\n\n- **package-one:** bugfix ([d39c809](https://github.com/mjwheatley/nx-monorepo/commit/d39c809))\n\n\n### ❤️  Thank You\n\n- Matt Wheatley',
    },
  },
};

describe('outputReleaseNotes()', () => {
  it('should output the release notes', async () => {
    await expect(outputReleaseNotes(nxReleaseChangelogResult)).resolves.toBeUndefined();
  });
});

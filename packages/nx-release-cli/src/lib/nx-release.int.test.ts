import { describe, expect, it } from 'vitest';

import { nxRelease } from './nx-release.js';

describe.skip('nxRelease', () => {
  it('should perform a first release dry run', async () => {
    await expect(
      nxRelease({
        dryRun: true,
        verbose: true,
        firstRelease: true,
      }),
    ).resolves.toEqual(0);
  }, 10_000);
});

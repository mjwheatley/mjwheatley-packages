import { nxRelease } from './nx-release';

describe('nxRelease', () => {
  it('should perform a first release dry run', () => {
    expect(
      nxRelease({
        dryRun: true,
        verbose: true,
        firstRelease: true,
      }),
    ).resolves.toEqual(0);
  });
});

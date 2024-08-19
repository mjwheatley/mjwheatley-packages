import { nxRelease } from './nx-release';

describe.skip('nxRelease', () => {
  it('should work perform a first release dry run', () => {
    expect(
      nxRelease({
        dryRun: true,
        verbose: false,
        firstRelease: true,
      }),
    ).resolves.toEqual('0');
  });
});

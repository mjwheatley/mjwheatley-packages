import { packageTwo } from './package-two';

describe('packageTwo', () => {
  it('should work', () => {
    expect(packageTwo()).toEqual('package-two');
  });
});

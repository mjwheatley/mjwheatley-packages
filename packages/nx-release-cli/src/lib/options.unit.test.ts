import { describe, it, expect } from 'vitest';

import { getOptions } from './options.js';

describe('getOptions()', () => {
  it('should return the default options', () => {
    expect(getOptions(['--version=1.2.3'])).toEqual({
      version: '1.2.3',
      dryRun: true,
      firstRelease: false,
      verbose: false,
    });
  });

  it('should return the provided options', () => {
    expect(getOptions(['--version=1.2.3', '--dry-run=true', '--first-release', '--verbose'])).toEqual({
      version: '1.2.3',
      dryRun: true,
      firstRelease: true,
      verbose: true,
    });

    expect(getOptions(['--version=1.2.3', '--dry-run=false', '--first-release', '--verbose'])).toEqual({
      version: '1.2.3',
      dryRun: false,
      firstRelease: true,
      verbose: true,
    });
  });
});

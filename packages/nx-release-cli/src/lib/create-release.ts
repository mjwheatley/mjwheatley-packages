import { releaseVersion } from 'nx/release/index.js';

import type { NxReleaseOptions } from './options.js';
import type { NxReleaseVersionResult } from 'nx/src/command-line/release/version.js';

export const createRelease = async (options: NxReleaseOptions): Promise<NxReleaseVersionResult> => {
  return await releaseVersion({
    specifier: options.version,
    dryRun: options.dryRun,
    verbose: options.verbose,
    firstRelease: options.firstRelease,
  });
};

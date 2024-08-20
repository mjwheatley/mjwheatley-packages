import { releaseVersion } from 'nx/release';
import { NxReleaseVersionResult } from 'nx/src/command-line/release/version';
import { NxReleaseOptions } from './options';

export const createRelease = async (options: NxReleaseOptions): Promise<NxReleaseVersionResult> => {
  return await releaseVersion({
    specifier: options.version,
    dryRun: options.dryRun,
    verbose: options.verbose,
    firstRelease: options.firstRelease,
  });
};

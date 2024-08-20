import { releasePublish } from 'nx/release';
import { NxReleaseOptions } from './options';

export const publishPackages = async ({
  dryRun,
  verbose,
  firstRelease,
  projects,
}: NxReleaseOptions & {
  projects?: string[];
}): Promise<number> => {
  return await releasePublish({
    projects,
    dryRun,
    verbose,
    firstRelease,
  });
};

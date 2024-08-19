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
  /**
   * The returned number value from releasePublish will be zero if all projects are published successfully, non-zero if not
   * **/
  const publishStatus = await releasePublish({
    projects,
    dryRun,
    verbose,
    firstRelease,
  });
  console.log('publishStatus', publishStatus);
  return publishStatus;
};

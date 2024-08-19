import { releaseChangelog } from 'nx/release';
import { NxReleaseChangelogResult } from 'nx/src/command-line/release/changelog';
import { VersionData } from 'nx/src/command-line/release/utils/shared';

export type GenerateReleaseNotesOptions = {
  projectsVersionData: VersionData;
  workspaceVersion: string | null | undefined;
  dryRun: boolean;
  verbose: boolean;
  firstRelease: boolean;
};

export const generateReleaseNotes = async ({
  projectsVersionData,
  workspaceVersion,
  dryRun,
  verbose,
  firstRelease,
}: GenerateReleaseNotesOptions): Promise<NxReleaseChangelogResult> => {
  console.log('generateReleaseNotes() options', {
    projectsVersionData,
    workspaceVersion,
    dryRun,
    verbose,
    firstRelease,
  });
  try {
    const nxReleaseChangelogResult = await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      dryRun,
      verbose,
      firstRelease,
    });
    console.log('nxReleaseChangelogResult', nxReleaseChangelogResult);
    return nxReleaseChangelogResult;
  } catch (error) {
    console.error('Error generating release notes', error);
    throw error;
  }
};

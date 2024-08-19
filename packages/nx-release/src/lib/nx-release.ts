import { NxReleaseOptions } from './options.js';
import { createRelease } from './create-release.js';
import { generateReleaseNotes } from './generate-release-notes.js';
import { publishPackages } from './publish-packages.js';
import { outputReleaseNotes } from './output-release-notes';

export const nxRelease = async (options: NxReleaseOptions): Promise<number> => {
  try {
    const { workspaceVersion, projectsVersionData } = await createRelease(options);

    const { dryRun, verbose, firstRelease } = options;
    const generateReleaseNotesResult = await generateReleaseNotes({
      projectsVersionData,
      workspaceVersion,
      dryRun,
      verbose,
      firstRelease,
    });
    // Do something with the result
    console.log('generateReleaseNotesResult', generateReleaseNotesResult);

    await outputReleaseNotes(generateReleaseNotesResult);

    return await publishPackages({
      ...options,
      projects: Object.keys(generateReleaseNotesResult.projectChangelogs as object),
    });
  } catch (error) {
    console.error('Error releasing', error);
    return 1;
  }
};

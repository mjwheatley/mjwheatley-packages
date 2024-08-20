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

    await outputReleaseNotes(generateReleaseNotesResult);

    const projects = Object.keys(generateReleaseNotesResult.projectChangelogs ?? {});
    if (projects.length) {
      return await publishPackages({
        ...options,
        projects,
      });
    }
    console.log('No projects to publish');
    return 0;
  } catch (error) {
    console.error('Error releasing', error);
    return 1;
  }
};

import { releasePublish } from 'nx/release/index.js';

import { createRelease } from './create-release.js';
import { generateReleaseNotes } from './generate-release-notes.js';
import { outputReleaseNotes } from './output-release-notes.js';

import type { NxReleaseOptions } from './options.js';

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
      const results = await releasePublish({
        ...options,
        projects,
      });

      for (const [projectName, { code }] of Object.entries(results)) {
        if (code !== 0) {
          console.error(`${projectName} has status code: ${String(code)}`);

          console.table(results);

          return code;
        }
      }

      return 0;
    }

    console.log('No projects to publish');

    return 0;
  } catch (error) {
    console.error('Error releasing', error);

    return 1;
  }
};

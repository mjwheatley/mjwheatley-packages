import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { NxReleaseChangelogResult } from 'nx/src/command-line/release/changelog.js';

export interface OutputFormat {
  name: string;
  notes: string;
  tag: string;
}

export const outputReleaseNotes = async ({
  projectChangelogs,
  workspaceChangelog,
}: NxReleaseChangelogResult): Promise<void> => {
  const output: OutputFormat[] = [];

  if (workspaceChangelog) {
    const { releaseVersion, contents } = workspaceChangelog;

    output.push({
      name: releaseVersion.rawVersion,
      notes: contents,
      tag: releaseVersion.gitTag,
    });
  }

  if (projectChangelogs) {
    for (const [projectName, changelog] of Object.entries(projectChangelogs)) {
      const { releaseVersion, contents } = changelog;

      output.push({
        name: `${projectName}-v${releaseVersion.rawVersion}`,
        notes: contents,
        tag: releaseVersion.gitTag,
      });
    }
  }

  const filePath = join(process.cwd(), '.nx-release-output.json');

  await writeFile(filePath, JSON.stringify(output, null, 2));
};

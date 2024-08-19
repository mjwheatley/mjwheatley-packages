import { writeFile } from 'fs/promises';
import { NxReleaseChangelogResult } from 'nx/src/command-line/release/changelog';

interface OutputFormat {
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
        name: `${projectName} ${releaseVersion.rawVersion}`,
        notes: contents,
        tag: releaseVersion.gitTag,
      });
    }
  }

  await writeFile('.nx-release-output.json', JSON.stringify(output, null, 2));
};

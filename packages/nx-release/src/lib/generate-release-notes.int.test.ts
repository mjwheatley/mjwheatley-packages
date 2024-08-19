import { generateReleaseNotes } from './generate-release-notes.js';

const generateReleaseNotesOptions = {
  projectsVersionData: {
    'semantic-release-config': {
      currentVersion: '1.0.1',
      newVersion: null,
      dependentProjects: [],
    },
    'commitlint-config': {
      currentVersion: '1.0.2',
      newVersion: null,
      dependentProjects: [],
    },
    'cspell-dictionary': {
      currentVersion: '1.0.2',
      newVersion: null,
      dependentProjects: [],
    },
    'prettier-config': {
      currentVersion: '1.0.2',
      newVersion: null,
      dependentProjects: [],
    },
    'package-one': {
      currentVersion: '1.1.0',
      newVersion: '1.1.1',
      dependentProjects: [],
    },
    'package-two': {
      currentVersion: '1.1.0',
      newVersion: null,
      dependentProjects: [],
    },
    'nx-release': {
      currentVersion: '0.1.0',
      newVersion: null,
      dependentProjects: [],
    },
  },
  workspaceVersion: undefined,
  dryRun: true,
  verbose: true,
  firstRelease: false,
};

describe('generateReleaseNotes()', () => {
  it('should output the changelog', async () => {
    await expect(generateReleaseNotes(generateReleaseNotesOptions)).resolves.toBeDefined();
  });
});

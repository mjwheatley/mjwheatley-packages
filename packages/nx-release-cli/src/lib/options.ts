import { parseArgs, type ParseArgsConfig } from 'node:util';

export type NxReleaseOptions = {
  version?: string | undefined;
  dryRun: boolean;
  verbose: boolean;
  firstRelease: boolean;
};

export const getOptions = (args?: NodeJS.Process['argv']): NxReleaseOptions => {
  const config = {
    // Allow passing in `args` for testing.
    args,
    allowPositionals: false,
    strict: true,
    tokens: false,
    options: {
      // Explicit version specifier to use, if overriding conventional commits
      version: {
        type: 'string',
        short: 'v',
      },
      // Whether or not to perform a dry-run of the release process, defaults to true
      'dry-run': {
        type: 'string',
        default: 'true',
      },
      // Whether or not this is the first release of the project, defaults to false
      'first-release': {
        type: 'boolean',
        default: false,
      },
      // Whether or not to enable verbose logging, defaults to false
      verbose: {
        type: 'boolean',
        default: false,
      },
    },
  } satisfies ParseArgsConfig;

  const { values } = parseArgs(config);

  return {
    version: values.version,
    dryRun: (typeof values['dry-run'] === 'string' ? values['dry-run'] : config.options['dry-run'].default) === 'true',
    firstRelease:
      typeof values['first-release'] === 'boolean' ? values['first-release'] : config.options['first-release'].default,
    verbose: typeof values.verbose === 'boolean' ? values.verbose : config.options.verbose.default,
  };
};

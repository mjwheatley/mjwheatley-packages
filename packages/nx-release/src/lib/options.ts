import * as yargs from 'yargs';

export type NxReleaseOptions = {
  version?: string | undefined;
  dryRun: boolean;
  verbose: boolean;
  firstRelease: boolean;
};

export const getOptions = async (): Promise<NxReleaseOptions> => {
  return await yargs
    .version(false) // don't use the default meaning of version in yargs
    .option('version', {
      description: 'Explicit version specifier to use, if overriding conventional commits',
      type: 'string',
    })
    .option('dryRun', {
      alias: 'd',
      description: 'Whether or not to perform a dry-run of the release process, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('firstRelease', {
      description: 'Whether or not this is the first release of the project, defaults to false',
      type: 'boolean',
      default: false,
    })
    .option('verbose', {
      description: 'Whether or not to enable verbose logging, defaults to false',
      type: 'boolean',
      default: false,
    })
    .parseAsync();
};

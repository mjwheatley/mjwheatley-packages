#!/usr/bin/env node

import { nxRelease } from './lib/nx-release.js';
import { getOptions } from './lib/options.js';

nxRelease(getOptions())
  .then((code) => {
    process.exit(code);
  })
  .catch((error: unknown) => {
    console.error('Error releasing', error);

    process.exitCode ??= 1;
  });

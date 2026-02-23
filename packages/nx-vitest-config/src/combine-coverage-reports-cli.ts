#!/usr/bin/env node

import { combineCoverageReports } from './combine-coverage-reports.js';

combineCoverageReports()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('Error combining coverage reports:', error);

    process.exitCode ??= 1;
  });

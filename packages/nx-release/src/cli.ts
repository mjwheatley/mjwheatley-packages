#!/usr/bin/env node

import { nxRelease } from './lib/nx-release.js';
import { getOptions } from './lib/options.js';

(async () => {
  const options = await getOptions();
  const publishStatus = await nxRelease(options);
  process.exit(publishStatus);
})();

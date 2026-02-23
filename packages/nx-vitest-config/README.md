# nx-vitest-config

## Setup

```typescript
import { defineConfig, getDirName, getProjectRoot } from '@mjwheatley/nx-vitest-config';

export default defineConfig({
  nxProjectRoot: getProjectRoot({ cwd: process.cwd() }),
  configDir: getDirName(import.meta.url),
});
```

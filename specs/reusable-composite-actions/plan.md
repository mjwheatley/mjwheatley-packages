# Plan: Reusable Composite Actions

## Overview

Create four reusable GitHub composite actions extracted from `pull-request.yml` and `release.yml`, then refactor both workflows to consume them. Replace local `tsx` invocations with published CLI binaries from `@mjwheatley/nx-release-cli` and `@mjwheatley/nx-vitest-config`.

---

## Prerequisites

- [x] Remove `"private": true` from `packages/nx-vitest-config/package.json`
- [x] Fix bin entry in `packages/nx-vitest-config/package.json` to `./dist/combine-coverage-reports-cli.js`

---

## Task 1: Create `.github/actions/setup/action.yml`

- [x] Implemented

**Purpose**: Checkout code, set up pnpm + Node.js, install dependencies, and audit.

**Inputs**:

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `node-auth-token` | ✅ | — | Token for npm registry auth (e.g., `GITHUB_TOKEN`) |
| `checkout-ref` | ❌ | `''` (uses triggering ref) | Git ref to checkout (e.g., PR head SHA) |
| `fetch-depth` | ❌ | `'0'` | Git fetch depth |
| `set-shas` | ❌ | `'false'` | Whether to run `nrwl/nx-set-shas` for affected commands |
| `main-branch-name` | ❌ | `''` | Main branch name for `nx-set-shas` |
| `audit` | ❌ | `'true'` | Whether to run `pnpm audit` |
| `registry-url` | ❌ | `'https://npm.pkg.github.com/'` | npm registry URL for `actions/setup-node` |

**Steps**:

1. `actions/checkout@v4` — with configurable `ref`, `token`, and `fetch-depth`
2. `nrwl/nx-set-shas@v4` — conditional on `set-shas == 'true'`, uses `main-branch-name`
3. `pnpm/action-setup@v4` — set up pnpm
4. `actions/setup-node@v4` — with pnpm cache, `.nvmrc`, and configurable `registry-url`
5. `pnpm install --frozen-lockfile` — with `NODE_AUTH_TOKEN` env
6. `pnpm audit --audit-level=moderate --prod --ignore-registry-errors` — conditional on `audit == 'true'`

**Notes**:

- The PR workflow uses `checkout-ref: ${{ github.event.pull_request.head.sha }}`, `set-shas: 'true'`, and `main-branch-name: ${{ github.base_ref }}`
- The release workflow uses defaults (no special ref, no set-shas)

---

## Task 2: Create `.github/actions/checks/action.yml`

- [ ] Implemented

**Purpose**: Run quality gate checks that are identical between PR and release flows.

**Inputs**:

| Input                       | Required | Default       | Description                                     |
| --------------------------- | -------- | ------------- | ----------------------------------------------- |
| `skip-sync-check`           | ❌       | `'false'`     | Skip `nx sync:check`                            |
| `skip-circular-check`       | ❌       | `'false'`     | Skip circular dependency check                  |
| `skip-secretlint`           | ❌       | `'false'`     | Skip secret scanning                            |
| `skip-spellcheck`           | ❌       | `'false'`     | Skip spell checking                             |
| `skip-format-check`         | ❌       | `'false'`     | Skip format checking                            |
| `spellcheck-pattern`        | ❌       | `'.'`         | Glob pattern for cspell (defaults to all files) |
| `circular-check-extensions` | ❌       | `'ts,js,tsx'` | File extensions for madge                       |

**Steps** (all use `pnpm exec` to avoid package.json script dependency):

1. `pnpm exec nx sync:check`
2. `pnpm exec madge --circular --extensions <extensions> .`
3. `pnpm exec secretlint . --maskSecrets`
4. `pnpm exec cspell --no-progress <pattern>`
5. `pnpm exec nx format:check --all`

**Notes**:

- All steps are skippable via their respective `skip-*` input
- Commands use `pnpm exec` instead of `pnpm <script>` so consuming repos don't need specific script names in their `package.json`
- `spellcheck-pattern` defaults to `'.'` (all files) — consuming repos can override with a more targeted pattern, or rely on their `cspell.json` `ignorePaths` to exclude files

---

## Task 3: Create `.github/actions/build-and-test/action.yml`

- [ ] Implemented

**Purpose**: Run typecheck, lint, build, test, combine coverage, report coverage, and upload artifacts.

**Inputs**:

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `mode` | ❌ | `'all'` | `'affected'` for PR (uses `nx affected`), `'all'` for release (uses `nx run-many`) |
| `parallel` | ❌ | `'4'` | Parallelism for nx tasks |
| `coverage-report` | ❌ | `'false'` | Whether to run vitest-coverage-report-action (PR only) |
| `upload-artifacts` | ❌ | `'true'` | Whether to upload coverage artifacts |
| `artifact-name-suffix` | ❌ | `''` | Suffix for artifact name (caller provides `github.run_id`-`github.run_number`) |
| `print-affected` | ❌ | `'false'` | Whether to print affected projects (PR only) |

**Steps**:

1. **Print affected projects** (conditional on `print-affected == 'true'`):
   - `pnpm exec nx show projects --affected --json`

2. **Typecheck, lint, build** (unified command, branched by `mode`):
   - `affected` mode: `pnpm exec nx affected -t typecheck lint build --batch --nxBail --parallel=<parallel> --no-tui`
   - `all` mode: `pnpm exec nx run-many -t typecheck lint build --batch --nxBail --parallel=<parallel> --no-tui`

3. **Test** (branched by `mode`):
   - `affected` mode: `pnpm exec nx affected -t test --nxBail --parallel=<parallel> --silent=passed-only --no-tui`
   - `all` mode: `pnpm exec nx run-many -t test --nxBail --parallel=<parallel> --silent=passed-only --no-tui`
   - Sets `NODE_ENV=test`

4. **Combine coverage reports**:
   - `pnpm exec combine-coverage-reports`
   - Uses the published `@mjwheatley/nx-vitest-config` bin (consuming repo must have it as a devDependency)

5. **Coverage report** (conditional on `coverage-report == 'true'`):
   - `davelosert/vitest-coverage-report-action@5b6122e3a819a3be7b27fc961b7faafb3bf00e4d` (pinned, updated periodically)
   - With `json-summary-path` and `json-final-path` pointing to combined coverage files

6. **Upload artifacts** (conditional on `upload-artifacts == 'true'`):
   - `actions/upload-artifact@v6`
   - Uploads `combined-lcov.info` and `combined-sonar-report.xml`

**Notes**:

- The `mode` input controls whether `nx affected` or `nx run-many` is used — same unified command structure for both
- `--silent=passed-only` is used in both modes
- `print-affected` lives here (not in `setup`) since it's specifically about which projects will be built/tested

---

## Task 4: Create `.github/actions/release/action.yml`

- [ ] Implemented

**Purpose**: Set up git user and run the nx-release CLI.

**Inputs**:

| Input             | Required | Default   | Description                              |
| ----------------- | -------- | --------- | ---------------------------------------- |
| `dry-run`         | ❌       | `'true'`  | Whether to perform a dry run             |
| `github-token`    | ✅       | —         | `GITHUB_TOKEN` for creating releases     |
| `node-auth-token` | ✅       | —         | Token for npm registry auth              |
| `npm-token`       | ❌       | `''`      | NPM token for publishing to npm registry |
| `first-release`   | ❌       | `'false'` | Whether this is the first release        |
| `verbose`         | ❌       | `'false'` | Enable verbose logging                   |

**Steps**:

1. **Setup Git User**:
   - `fregante/setup-git-user@v2`

2. **Release**:
   - `pnpm exec nx-release --dry-run=<dry-run>`
   - Additional flags: `--first-release` (conditional), `--verbose` (conditional)
   - Environment variables: `GITHUB_TOKEN`, `NODE_AUTH_TOKEN`, `NPM_TOKEN`, `NPM_CONFIG_PROVENANCE`
   - Uses the published `@mjwheatley/nx-release-cli` bin (consuming repo must have it as a devDependency)

**Notes**:

- `NPM_CONFIG_PROVENANCE` is set conditionally: `'true'` if `npm-token` is provided, `'false'` otherwise
- The `if: success()` condition from the original workflow should be handled by the calling workflow, not the action itself

---

## Task 5: Refactor `pull-request.yml` to Use Composite Actions

- [ ] Implemented

Replace the step-by-step implementation with composite action references.

**Target structure**:

```yaml
jobs:
  pull-request:
    runs-on: ubuntu-latest
    steps:
      - name: Setup
        uses: ./.github/actions/setup
        with:
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          checkout-ref: ${{ github.event.pull_request.head.sha }}
          set-shas: 'true'
          main-branch-name: ${{ github.base_ref }}

      - name: Quality Checks
        uses: ./.github/actions/checks
        with:
          spellcheck-pattern: '"./{.github,packages}/**/*.{md,js,mjs,cjs,ts,mts,cts,tsx,json,yml}" "./*.{md,js,mjs,cjs,ts,mts,cts,tsx,json}"'

      - name: Build and Test
        uses: ./.github/actions/build-and-test
        with:
          mode: 'affected'
          print-affected: 'true'
          coverage-report: 'true'
          artifact-name-suffix: ${{ github.run_id }}-${{ github.run_number }}

      - name: Release [Dry Run]
        if: success()
        uses: ./.github/actions/release
        with:
          dry-run: 'true'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

**Permissions**: Keep all existing permissions (including `actions: read` for `nx affected`).

---

## Task 6: Refactor `release.yml` to Use Composite Actions

- [ ] Implemented

**Target structure**:

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Setup
        uses: ./.github/actions/setup
        with:
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Quality Checks
        uses: ./.github/actions/checks
        with:
          spellcheck-pattern: '"./{.github,packages}/**/*.{md,js,mjs,cjs,ts,mts,cts,tsx,json,yml}" "./*.{md,js,mjs,cjs,ts,mts,cts,tsx,json}"'

      - name: Build and Test
        uses: ./.github/actions/build-and-test
        with:
          mode: 'all'
          artifact-name-suffix: ${{ github.run_id }}-${{ github.run_number }}

      - name: Release
        if: success()
        uses: ./.github/actions/release
        with:
          dry-run: 'false'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          npm-token: ${{ secrets.NPM_TOKEN }}
```

**Permissions**: Keep all existing permissions (no `actions: read` needed).

---

## Task 7: Create `.github/actions/README.md`

- [ ] Implemented

Document the composite actions for external consumers:

1. **Overview** — what each action does
2. **Usage examples** — how to reference from an external repo
3. **Required devDependencies** — packages that must be installed
4. **Required configuration files** — `.nvmrc`, `nx.json`, etc.
5. **Required package.json scripts** — none! (all commands use `pnpm exec` directly)
6. **Input reference** — table of all inputs per action
7. **Example package.json scripts** — a block of scripts that consuming repos can add to their root `package.json` to run all CI steps locally, both individually and as a combined command
8. **Makefile targets** — equivalent Make targets for running the full workflow locally

**Example scripts block for README**:

```jsonc
// package.json scripts
{
  "check:circular": "madge --circular --extensions ts,js,tsx .",
  "secretlint": "secretlint . --maskSecrets",
  "spellcheck": "cspell --no-progress .",
  "format:check": "nx format:check --all",
  "typecheck": "nx run-many -t typecheck --no-tui",
  "lint": "nx run-many -t lint --no-tui",
  "build": "nx run-many -t build --no-tui",
  "test:all": "nx run-many -t test --nxBail --parallel=4 --silent=passed-only --no-tui",
  "test:coverage:combine": "combine-coverage-reports",
  "release:dry-run": "nx-release --dry-run=true",
  "ci:checks": "pnpm exec nx sync:check && pnpm check:circular && pnpm secretlint && pnpm spellcheck && pnpm format:check",
  "ci:build-and-test": "pnpm typecheck && pnpm lint && pnpm build && pnpm test:all && pnpm test:coverage:combine",
  "ci": "pnpm ci:checks && pnpm ci:build-and-test",
}
```

---

## Task 8: Update `nx.json` Shared Globals

- [ ] Implemented

The `sharedGlobals` namedInput currently references the workflow files. Add the composite action files so that changes to them invalidate the Nx cache:

```json
{
  "sharedGlobals": [
    "{workspaceRoot}/.github/workflows/pull-request.yml",
    "{workspaceRoot}/.github/workflows/release.yml",
    "{workspaceRoot}/.github/actions/setup/action.yml",
    "{workspaceRoot}/.github/actions/checks/action.yml",
    "{workspaceRoot}/.github/actions/build-and-test/action.yml",
    "{workspaceRoot}/.github/actions/release/action.yml"
  ]
}
```

---

## Task 9: Add `specs/` to Ignore Files

- [ ] Implemented

Add `specs/` to ignore patterns where appropriate:

- `cspell.json` `ignorePaths` — no need to spellcheck spec files (or do spellcheck them for quality)
- `.secretlintrc` — likely fine as-is
- Consider adding to `.gitignore` if specs should not be committed (likely they should be committed)

---

## Summary: File Changes

| File                                        | Action                                           |
| ------------------------------------------- | ------------------------------------------------ |
| `.github/actions/setup/action.yml`          | **Create**                                       |
| `.github/actions/checks/action.yml`         | **Create**                                       |
| `.github/actions/build-and-test/action.yml` | **Create**                                       |
| `.github/actions/release/action.yml`        | **Create**                                       |
| `.github/actions/README.md`                 | **Create**                                       |
| `.github/workflows/pull-request.yml`        | **Modify** — refactor to use composite actions   |
| `.github/workflows/release.yml`             | **Modify** — refactor to use composite actions   |
| `nx.json`                                   | **Modify** — add action files to `sharedGlobals` |
| `packages/nx-vitest-config/package.json`    | Already done ✅                                  |

---

## Resolved Questions

1. **Spellcheck pattern as input**: ✅ Optional input defaulting to `'.'` (all files) — repos can override or rely on `cspell.json` `ignorePaths`.

2. **Registry URL**: ✅ Optional input on `setup` action with default `'https://npm.pkg.github.com/'`.

3. **`--silent=passed-only`**: ✅ Used in both `affected` and `all` modes.

4. **Coverage report action version pin**: ✅ Keep the SHA pin, update periodically.

5. **`print-affected` placement**: ✅ Stays in `build-and-test` action.

# Reusable Composite Actions for Nx + pnpm Monorepos

This directory contains four composite GitHub Actions for use in Nx + pnpm monorepos. These actions encapsulate the best practices for CI/CD, quality checks, build/test, and release workflows, and are designed to be reusable across multiple repositories.

## Actions Overview

- **setup**: Checks out code, sets up pnpm and Node.js, installs dependencies, and audits for vulnerabilities.
- **checks**: Runs quality gate checks (sync, circular deps, secrets, spellcheck, formatting) using direct commands (no reliance on package.json scripts).
- **build-and-test**: Runs typecheck, lint, build, test, combines coverage, optionally reports coverage, and uploads artifacts.
- **release**: Sets up git user and runs the published `@mjwheatley/nx-release-cli` for semantic release and publishing.

## Usage Example

Reference these actions from your workflow YAML (using a remote repo):

```yaml
jobs:
  pull-request:
    runs-on: ubuntu-latest
    steps:
      - name: Setup
        uses: mjwheatley/mjwheatley-packages/.github/actions/setup@main
        with:
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
          checkout-ref: ${{ github.event.pull_request.head.sha }}
          set-shas: 'true'
          main-branch-name: ${{ github.base_ref }}

      - name: Quality Checks
        uses: mjwheatley/mjwheatley-packages/.github/actions/checks@main
        with:
          spellcheck-pattern: '"./{.github,packages}/**/*.{md,js,mjs,cjs,ts,mts,cts,tsx,json,yml}" "./*.{md,js,mjs,cjs,ts,mts,cts,tsx,json}"'

      - name: Build and Test
        uses: mjwheatley/mjwheatley-packages/.github/actions/build-and-test@main
        with:
          mode: 'affected'
          print-affected: 'true'
          coverage-report: 'true'
          artifact-name-suffix: ${{ github.run_id }}-${{ github.run_number }}

      - name: Release [Dry Run]
        if: success()
        uses: mjwheatley/mjwheatley-packages/.github/actions/release@main
        with:
          dry-run: 'true'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

## Required devDependencies

Your repo must have these as devDependencies:

- `@mjwheatley/nx-release-cli`
- `@mjwheatley/nx-vitest-config`
- `madge`
- `secretlint`
- `cspell`
- `pnpm`
- `nx` (and plugins as needed)

### Install all required devDependencies

```sh
pnpm add -D @mjwheatley/nx-release-cli @mjwheatley/nx-vitest-config madge secretlint cspell pnpm nx
```

## Required configuration files

- `.nvmrc` (for Node.js version)
- `nx.json` (Nx workspace config)
- `cspell.json` (for spellcheck)
- `.secretlintrc` (for secretlint)

## Required package.json scripts

None required! All commands use `pnpm exec` directly. However, for local development, you may want to add these:

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

## Makefile targets (optional)

```makefile
ci-checks:
	pnpm exec nx sync:check
	pnpm check:circular
	pnpm secretlint
	pnpm spellcheck
	pnpm format:check

ci-build-and-test:
	pnpm typecheck
	pnpm lint
	pnpm build
	pnpm test:all
	pnpm test:coverage:combine

ci: ci-checks ci-build-and-test
```

## Inputs Reference

### setup

| Input            | Required | Default                       | Description                      |
| ---------------- | -------- | ----------------------------- | -------------------------------- |
| node-auth-token  | ✅       | —                             | Token for npm registry auth      |
| checkout-ref     | ❌       | ''                            | Git ref to checkout              |
| fetch-depth      | ❌       | '0'                           | Git fetch depth                  |
| set-shas         | ❌       | 'false'                       | Whether to run nx-set-shas       |
| main-branch-name | ❌       | ''                            | Main branch name for nx-set-shas |
| audit            | ❌       | 'true'                        | Whether to run pnpm audit        |
| registry-url     | ❌       | 'https://npm.pkg.github.com/' | npm registry URL                 |

### checks

| Input                     | Required | Default     | Description                    |
| ------------------------- | -------- | ----------- | ------------------------------ |
| skip-sync-check           | ❌       | 'false'     | Skip nx sync:check             |
| skip-circular-check       | ❌       | 'false'     | Skip circular dependency check |
| skip-secretlint           | ❌       | 'false'     | Skip secret scanning           |
| skip-spellcheck           | ❌       | 'false'     | Skip spell checking            |
| skip-format-check         | ❌       | 'false'     | Skip format checking           |
| spellcheck-pattern        | ❌       | '.'         | Glob pattern for cspell        |
| circular-check-extensions | ❌       | 'ts,js,tsx' | File extensions for madge      |

### build-and-test

| Input                | Required | Default | Description                                  |
| -------------------- | -------- | ------- | -------------------------------------------- |
| mode                 | ❌       | 'all'   | 'affected' for PR, 'all' for release         |
| parallel             | ❌       | '4'     | Parallelism for nx tasks                     |
| coverage-report      | ❌       | 'false' | Whether to run vitest-coverage-report-action |
| upload-artifacts     | ❌       | 'true'  | Whether to upload coverage artifacts         |
| artifact-name-suffix | ❌       | ''      | Suffix for artifact name                     |
| print-affected       | ❌       | 'false' | Whether to print affected projects           |

### release

| Input           | Required | Default | Description                              |
| --------------- | -------- | ------- | ---------------------------------------- |
| dry-run         | ❌       | 'true'  | Whether to perform a dry run             |
| github-token    | ✅       | —       | GITHUB_TOKEN for creating releases       |
| node-auth-token | ✅       | —       | Token for npm registry auth              |
| npm-token       | ❌       | ''      | NPM token for publishing to npm registry |
| first-release   | ❌       | 'false' | Whether this is the first release        |
| verbose         | ❌       | 'false' | Enable verbose logging                   |

---

For more details, see the [specs/reusable-composite-actions/plan.md](../../specs/reusable-composite-actions/plan.md).

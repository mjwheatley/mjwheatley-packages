# Research: Reusable Composite Actions

## Objective

Extract the CI/CD logic from `pull-request.yml` and `release.yml` into four reusable GitHub composite actions so that other Nx+pnpm monorepos can consume them.

---

## Current Workflow Analysis

### pull-request.yml (PR flow)

| Step | Command | Source |
| --- | --- | --- |
| Checkout | `actions/checkout@v4` with `ref: github.event.pull_request.head.sha` | built-in |
| Nx set-shas | `nrwl/nx-set-shas@v4` with `main-branch-name: github.base_ref` | built-in |
| Setup pnpm | `pnpm/action-setup@v4` | built-in |
| Setup Node.js | `actions/setup-node@v4` with `.nvmrc` + GitHub Packages registry | built-in |
| Install | `pnpm install --frozen-lockfile` | direct |
| Audit | `pnpm audit --audit-level=moderate --prod --ignore-registry-errors` | direct |
| Print affected | `pnpm exec nx show projects --affected --json` | direct |
| Nx sync check | `pnpm exec nx sync:check` | direct |
| Circular check | `pnpm check:circular` → `madge --circular --extensions ts,js,tsx .` | **package.json script** |
| Secretlint | `pnpm secretlint` → `secretlint . --maskSecrets` | **package.json script** |
| Spellcheck | `pnpm spellcheck` → `cspell --no-progress "./{.github,packages}/..." "./*.{...}"` | **package.json script** |
| Format check | `pnpm format:check` → `nx format:check --all` | **package.json script** |
| Typecheck+lint+build | `pnpm exec nx affected -t typecheck lint build --batch --nxBail --parallel=4 --no-tui` | direct |
| Test | `pnpm exec nx affected -t test --nxBail --parallel=4 --no-tui` | direct |
| Combine coverage | `pnpm test:coverage:combine` → `pnpm dlx tsx packages/nx-vitest-config/src/combine-coverage-reports-cli.ts` | **package.json script (local tsx)** |
| Coverage report | `davelosert/vitest-coverage-report-action@v2.9.0` | built-in |
| Upload artifacts | `actions/upload-artifact@v6` | built-in |
| Git user | `fregante/setup-git-user@v2` | built-in |
| Release (dry-run) | `pnpm dlx tsx packages/nx-release-cli/src/cli.ts --dry-run=true` | **local tsx invocation** |

### release.yml (Release flow)

| Step | Command | Source |
| --- | --- | --- |
| Checkout | `actions/checkout@v4` (no PR ref) | built-in |
| _(no nx-set-shas)_ | — | — |
| Setup pnpm | same | built-in |
| Setup Node.js | same | built-in |
| Install | same | direct |
| Audit | same | direct |
| Nx sync check | same | direct |
| Circular check | `pnpm check:circular` | **package.json script** |
| Secretlint | `pnpm secretlint` | **package.json script** |
| Spellcheck | `pnpm spellcheck` | **package.json script** |
| Format check | `pnpm format:check` | **package.json script** |
| Typecheck | `pnpm typecheck` → `nx run-many -t typecheck --no-tui` | **package.json script** |
| Lint | `pnpm lint` → `nx run-many -t lint --no-tui` | **package.json script** |
| Build | `pnpm build` → `nx run-many -t build --no-tui` | **package.json script** |
| Test | `pnpm test:all` → `nx run-many -t test --nxBail --parallel=4 --silent=passed-only --no-tui` | **package.json script** |
| Combine coverage | `pnpm test:coverage:combine` | **package.json script (local tsx)** |
| Upload artifacts | same | built-in |
| Git user | same | built-in |
| Release | `pnpm dlx tsx packages/nx-release-cli/src/cli.ts --dry-run=false` | **local tsx invocation** |

---

## Package.json Script → Direct Command Mapping

| Script Name | Script Command | Replacement for Composite Action |
| --- | --- | --- |
| `check:circular` | `madge --circular --extensions ts,js,tsx .` | `pnpm exec madge --circular --extensions ts,js,tsx .` |
| `secretlint` | `secretlint . --maskSecrets` | `pnpm exec secretlint . --maskSecrets` |
| `spellcheck` | `cspell --no-progress "./{.github,packages}/..." "./*.{...}"` | `pnpm exec cspell --no-progress <pattern>` |
| `format:check` | `nx format:check --all` | `pnpm exec nx format:check --all` |
| `typecheck` | `nx run-many -t typecheck --no-tui` | `pnpm exec nx run-many -t typecheck --no-tui` |
| `lint` | `nx run-many -t lint --no-tui` | `pnpm exec nx run-many -t lint --no-tui` |
| `build` | `nx run-many -t build --no-tui` | `pnpm exec nx run-many -t build --no-tui` |
| `test:all` | `nx run-many -t test --nxBail --parallel=4 --silent=passed-only --no-tui` | `pnpm exec nx run-many -t test --nxBail --parallel=4 --no-tui` |
| `test:coverage:combine` | `pnpm dlx tsx packages/nx-vitest-config/src/combine-coverage-reports-cli.ts` | `pnpm exec combine-coverage-reports` (from `@mjwheatley/nx-vitest-config` installed as devDep) |

---

## CLI Replacements

### nx-release-cli

- **Current**: `pnpm dlx tsx packages/nx-release-cli/src/cli.ts --dry-run=<value>`
- **Published bin**: `nx-release` (from `@mjwheatley/nx-release-cli`)
- **Replacement**: `pnpm exec nx-release --dry-run=<value>`
- **CLI flags**: `--dry-run=<true|false>`, `--first-release`, `--verbose`, `--version=<semver>`

### nx-vitest-config (combine-coverage-reports)

- **Current**: `pnpm dlx tsx packages/nx-vitest-config/src/combine-coverage-reports-cli.ts`
- **Published bin**: `combine-coverage-reports` (from `@mjwheatley/nx-vitest-config`)
- **Replacement**: `pnpm exec combine-coverage-reports`
- **CLI flags**: none (no arguments)

---

## Composite Actions vs Reusable Workflows

| Feature                          | Composite Actions               | Reusable Workflows                       |
| -------------------------------- | ------------------------------- | ---------------------------------------- |
| Shares job filesystem            | ✅ Yes (runs inline)            | ❌ No (separate job)                     |
| Can access secrets directly      | ❌ Must pass as inputs          | ✅ Via `secrets: inherit`                |
| Granularity                      | Step-level composition          | Job-level composition                    |
| Can use `if` on individual steps | ✅ Yes                          | Only at job level                        |
| Can upload artifacts mid-job     | ✅ Yes                          | ✅ Yes                                   |
| Caller complexity                | Low (add steps to existing job) | Higher (separate jobs, artifact passing) |

**Decision**: Composite actions — all steps need the same checked-out workspace/node_modules. Reusable workflows would require artifact passing between jobs for the build output and coverage files.

---

## Secrets Handling

Composite actions **cannot** access the `secrets` context. All secrets must be passed explicitly as `inputs` by the calling workflow. Required secrets:

| Secret         | Used By                                    | Required                                    |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| `GITHUB_TOKEN` | Checkout, install (registry auth), release | Always                                      |
| `NPM_TOKEN`    | Release (npm publish)                      | Optional (only for npm registry publishing) |

---

## Required devDependencies for Consuming Repos

Consuming repos must have these installed to use the composite actions:

| Package                         | Used By                                                |
| ------------------------------- | ------------------------------------------------------ |
| `nx`                            | All Nx commands                                        |
| `madge`                         | `checks` action (circular dependency check)            |
| `secretlint` + secretlint rules | `checks` action (secret scanning)                      |
| `cspell`                        | `checks` action (spell checking)                       |
| `prettier`                      | `checks` action (format check via nx)                  |
| `@mjwheatley/nx-release-cli`    | `release` action                                       |
| `@mjwheatley/nx-vitest-config`  | `build-and-test` action (combine-coverage-reports bin) |
| `@vitest/coverage-v8`           | Test coverage                                          |

---

## Required Configuration Files for Consuming Repos

| File                                | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `.nvmrc`                            | Node.js version for `actions/setup-node` |
| `nx.json`                           | Nx workspace configuration               |
| `pnpm-workspace.yaml`               | pnpm workspace configuration             |
| `.secretlintrc.json` or equivalent  | Secretlint configuration                 |
| `cspell.json`                       | CSpell configuration                     |
| `prettier.config.mjs` or equivalent | Prettier configuration                   |

---

## File Structure

```
.github/
  actions/
    setup/
      action.yml          # Checkout, pnpm, Node.js, install, audit
    checks/
      action.yml          # Sync check, circular deps, secrets, spelling, formatting
    build-and-test/
      action.yml          # Typecheck, lint, build, test, coverage combine, upload
    release/
      action.yml          # Git user setup, nx-release
  workflows/
    pull-request.yml      # Refactored to use composite actions
    release.yml           # Refactored to use composite actions
```

---

## How Consuming Repos Reference These Actions

Since these actions live in this repository, external repos reference them as:

```yaml
- uses: mjwheatley/mjwheatley-packages/.github/actions/setup@main
  with:
    node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

For local use within this repo:

```yaml
- uses: ./.github/actions/setup
  with:
    node-auth-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Key Differences Between PR and Release Flows

| Aspect                | PR Flow                              | Release Flow                               |
| --------------------- | ------------------------------------ | ------------------------------------------ |
| Checkout ref          | `github.event.pull_request.head.sha` | default (triggering branch)                |
| nx-set-shas           | Yes (for `nx affected`)              | No                                         |
| Typecheck/lint/build  | `nx affected -t ... --batch`         | `nx run-many -t ...` (separate steps)      |
| Test                  | `nx affected -t test`                | `nx run-many -t test --silent=passed-only` |
| Coverage report       | Yes (vitest-coverage-report-action)  | No                                         |
| Release dry-run       | `--dry-run=true`                     | `--dry-run=false`                          |
| NPM_TOKEN             | Not used                             | Optional                                   |
| NPM_CONFIG_PROVENANCE | Not set                              | Conditional on NPM_TOKEN                   |
| Permissions           | Includes `actions: read`             | Does not include `actions: read`           |

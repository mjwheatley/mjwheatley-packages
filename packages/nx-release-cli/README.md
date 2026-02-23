# nx-release-cli

This package provides a programmatic version of the `nx release` command in order to extract the changelog to be able to upload the release notes.

### Usage

By default, the CLI command will run in `dry-run` mode to see the changes that will be made without actually making them. To actually make the changes, you will need to use the `--dry-run=false` flag.

- Run the command from the root of the repository.

```bash
cd ../../
pnpm dlx tsx packages/nx-release-cli/src/cli.ts
```

The command should generate a `.nx-release-output.json` file in the root of the repository.

---

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build nx-release-cli` to build the library.

## Running unit tests

Run `nx test nx-release-cli` to execute the unit tests via [Vitest](https://vitest.dev/).

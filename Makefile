.PHONY: instructions install audit reset sync test build startover clean rm-coverage rm-dist rm-node-modules ci ci-checks ci-build-and-test

instructions:
	-@ echo "Available commands:"
	-@ echo "make install"
	-@ echo "make reset"
	-@ echo "make test"
	-@ echo "make build"
	-@ echo "make clean"
	-@ echo "make startover"

install:
	@echo "Installing dependencies"
	-@ pnpm i --frozen-lockfile
	@echo "Dependencies installed"

audit:
	@echo "Running prod audit"
	pnpm audit --audit-level=moderate --prod --ignore-registry-errors
	@echo "Audit complete"

reset:
	@echo "Resetting Nx"
	-@ pnpm exec nx reset

sync:
	@echo "Syncing TypeScript configs"
	-@ pnpm exec nx sync

test:
	pnpm test

# Clean the workspace and reinstall dependencies
startover: clean rm-node-modules install reset

# Wipe out old build artifacts
clean: rm-coverage rm-dist

build:
	@echo "Building all projects..."
	-@ pnpm exec nx run-many --target=build
	@echo "Build complete"

rm-coverage:
	@echo "Removing coverage folders..."
	-@ rm -rf ./coverage ./packages/*/coverage
	@echo "coverage folders have been removed"

rm-dist:
	@echo "Removing dist folders..."
	-@ rm -rf ./dist ./packages/*/dist ./packages/*/.sst ./packages/*/*.tsbuildinfo ./packages/*/.sst.config.*.mjs ./packages/*/vitest.config.mts.timestamp-*.mjs
	@echo "dist folders have been removed"

rm-node-modules:
	@echo "Removing node_modules folders..."
	-@ rm -rf ./node_modules ./packages/*/node_modules
	@echo "node_modules folders have been removed"

ci-checks:
	pnpm exec nx sync:check
	pnpm check:circular
	pnpm secretlint
	pnpm spellcheck
	pnpm format:check

ci-build-and-test:
	pnpm exec nx run-many -t typecheck lint build --batch --nxBail --parallel=4 --no-tui
	pnpm test:all
	pnpm test:coverage:combine

ci: ci-checks ci-build-and-test

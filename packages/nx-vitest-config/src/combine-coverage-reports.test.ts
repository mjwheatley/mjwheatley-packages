import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, normalize } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseStringPromise } from 'xml2js';

import {
  combineCoverageReports,
  combineSonarReports,
  findFiles,
  normalizeFilePath,
} from './combine-coverage-reports.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const mockBuildObject = vi.fn().mockReturnValue('<testExecutions/>');

vi.mock('xml2js', () => ({
  parseStringPromise: vi.fn(),
  Builder: vi.fn().mockImplementation(function (this: { buildObject: typeof mockBuildObject }) {
    this.buildObject = mockBuildObject;
  }),
}));

const mockExistsSync = vi.mocked(existsSync);
const mockMkdirSync = vi.mocked(mkdirSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockParseStringPromise = vi.mocked(parseStringPromise);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * Helper to extract the content argument from a writeFileSync call matching a given filename substring.
 */
const getWriteCallContent = (fileNameSubstring: string): string => {
  const call = mockWriteFileSync.mock.calls.find((c) => String(c[0]).includes(fileNameSubstring));

  expect(call).toBeDefined();

  return call?.[1] as string;
};

describe('combine-coverage-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildObject.mockReturnValue('<testExecutions/>');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeFilePath', () => {
    it('should normalize an absolute path to be relative to the project root', () => {
      const result = normalizeFilePath('/home/user/project/packages/my-lib/src/index.ts', '/home/user/project');

      expect(result).toBe(normalize('packages/my-lib/src/index.ts'));
    });

    it('should return the file name when it is directly in the project root', () => {
      const result = normalizeFilePath('/home/user/project/file.ts', '/home/user/project');

      expect(result).toBe('file.ts');
    });

    it('should handle paths with trailing slashes', () => {
      const result = normalizeFilePath('/home/user/project/src/file.ts', '/home/user/project/');

      expect(result).toBe(normalize('src/file.ts'));
    });

    it('should return "." when the path is the project root itself', () => {
      const result = normalizeFilePath('/home/user/project', '/home/user/project');

      expect(result).toBe('.');
    });
  });

  describe('findFiles', () => {
    it('should find files matching the target file name in a flat directory', () => {
      mockReaddirSync.mockReturnValue([
        { name: 'coverage-summary.json', isDirectory: () => false, isFile: () => true },
        { name: 'other.txt', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      const result = findFiles('/root', 'coverage-summary.json');

      expect(result).toEqual([join('/root', 'coverage-summary.json')]);
    });

    it('should recursively find files in subdirectories', () => {
      mockReaddirSync
        .mockReturnValueOnce([
          { name: 'sub1', isDirectory: () => true, isFile: () => false },
          { name: 'sub2', isDirectory: () => true, isFile: () => false },
        ] as unknown as ReturnType<typeof readdirSync>)
        .mockReturnValueOnce([
          { name: 'sonar-report.xml', isDirectory: () => false, isFile: () => true },
        ] as unknown as ReturnType<typeof readdirSync>)
        .mockReturnValueOnce([
          { name: 'sonar-report.xml', isDirectory: () => false, isFile: () => true },
        ] as unknown as ReturnType<typeof readdirSync>);

      const result = findFiles('/root', 'sonar-report.xml');

      expect(result).toEqual([join('/root/sub1', 'sonar-report.xml'), join('/root/sub2', 'sonar-report.xml')]);
    });

    it('should return an empty array when no matching files are found', () => {
      mockReaddirSync.mockReturnValue([
        { name: 'other.txt', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      const result = findFiles('/root', 'coverage-summary.json');

      expect(result).toEqual([]);
    });

    it('should return an empty array for an empty directory', () => {
      mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof readdirSync>);

      const result = findFiles('/root', 'any-file.json');

      expect(result).toEqual([]);
    });

    it('should handle deeply nested directories', () => {
      mockReaddirSync
        .mockReturnValueOnce([
          { name: 'level1', isDirectory: () => true, isFile: () => false },
        ] as unknown as ReturnType<typeof readdirSync>)
        .mockReturnValueOnce([
          { name: 'level2', isDirectory: () => true, isFile: () => false },
        ] as unknown as ReturnType<typeof readdirSync>)
        .mockReturnValueOnce([
          { name: 'target.json', isDirectory: () => false, isFile: () => true },
        ] as unknown as ReturnType<typeof readdirSync>);

      const result = findFiles('/root', 'target.json');

      expect(result).toEqual([join('/root/level1/level2', 'target.json')]);
    });
  });

  describe('combineSonarReports', () => {
    it('should combine multiple sonar report XML files into one', async () => {
      const file1 = {
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib1/src/index.test.ts' },
              testCase: [{ $: { name: 'test1', duration: '100' } }],
            },
          ],
        },
      };
      const file2 = {
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib2/src/index.test.ts' },
              testCase: [{ $: { name: 'test2', duration: '200' } }],
            },
          ],
        },
      };

      mockReadFileSync.mockReturnValueOnce('<xml1/>').mockReturnValueOnce('<xml2/>');
      mockParseStringPromise.mockResolvedValueOnce(file1).mockResolvedValueOnce(file2);

      await combineSonarReports(['/path/sonar1.xml', '/path/sonar2.xml'], '/output/combined.xml');

      expect(mockWriteFileSync).toHaveBeenCalledOnce();
      expect(mockWriteFileSync).toHaveBeenCalledWith('/output/combined.xml', expect.any(String), 'utf-8');
      expect(mockBuildObject).toHaveBeenCalledWith({
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib1/src/index.test.ts' },
              testCase: [{ $: { name: 'test1', duration: '100' } }],
            },
            {
              $: { path: 'packages/lib2/src/index.test.ts' },
              testCase: [{ $: { name: 'test2', duration: '200' } }],
            },
          ],
        },
      });
    });

    it('should deduplicate files with the same path and merge test cases', async () => {
      const file1 = {
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib1/src/index.test.ts' },
              testCase: [{ $: { name: 'test1', duration: '100' } }],
            },
          ],
        },
      };
      const file2 = {
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib1/src/index.test.ts' },
              testCase: [{ $: { name: 'test2', duration: '200' } }],
            },
          ],
        },
      };

      mockReadFileSync.mockReturnValueOnce('<xml1/>').mockReturnValueOnce('<xml2/>');
      mockParseStringPromise.mockResolvedValueOnce(file1).mockResolvedValueOnce(file2);

      await combineSonarReports(['/path/sonar1.xml', '/path/sonar2.xml'], '/output/combined.xml');

      expect(mockBuildObject).toHaveBeenCalledWith({
        testExecutions: {
          $: { version: '1' },
          file: [
            {
              $: { path: 'packages/lib1/src/index.test.ts' },
              testCase: [{ $: { name: 'test1', duration: '100' } }, { $: { name: 'test2', duration: '200' } }],
            },
          ],
        },
      });
    });

    it('should handle errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(noop);

      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await combineSonarReports(['/nonexistent.xml'], '/output/combined.xml');

      expect(consoleSpy).toHaveBeenCalledWith('Error combining sonar reports:', expect.any(Error));
    });

    it('should handle an empty array of input files', async () => {
      await combineSonarReports([], '/output/combined.xml');

      expect(mockBuildObject).toHaveBeenCalledWith({
        testExecutions: {
          $: { version: '1' },
          file: [],
        },
      });
      expect(mockWriteFileSync).toHaveBeenCalledOnce();
    });
  });

  describe('combineCoverageReports', () => {
    let originalCwd: () => string;

    beforeEach(() => {
      originalCwd = process.cwd.bind(process);
      process.cwd = vi.fn().mockReturnValue('/home/user/project');
      vi.spyOn(console, 'log').mockImplementation(noop);
    });

    afterEach(() => {
      process.cwd = originalCwd;
    });

    it('should create the coverage directory if it does not exist', async () => {
      mockExistsSync.mockReturnValue(false);
      mockMkdirSync.mockReturnValue(undefined);
      mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof readdirSync>);

      await combineCoverageReports();

      expect(mockMkdirSync).toHaveBeenCalledWith(join('/home/user/project', 'coverage'), { recursive: true });
    });

    it('should not create the coverage directory if it already exists', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof readdirSync>);

      await combineCoverageReports();

      expect(mockMkdirSync).not.toHaveBeenCalled();
    });

    it('should combine all coverage report types and write output files', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof readdirSync>);

      await combineCoverageReports();

      // Verify that writeFileSync was called for each output type:
      // 1. combined-sonar-report.xml
      // 2. combined-coverage-summary.json
      // 3. combined-coverage-final.json
      // 4. combined-lcov.info
      expect(mockWriteFileSync).toHaveBeenCalledTimes(4);

      const outputPaths = mockWriteFileSync.mock.calls.map((call) => call[0]);

      expect(outputPaths).toContain(join('/home/user/project', 'coverage', 'combined-sonar-report.xml'));
      expect(outputPaths).toContain(join('/home/user/project', 'coverage', 'combined-coverage-summary.json'));
      expect(outputPaths).toContain(join('/home/user/project', 'coverage', 'combined-coverage-final.json'));
      expect(outputPaths).toContain(join('/home/user/project', 'coverage', 'combined-lcov.info'));
    });

    it('should merge and normalize coverage-summary.json files', async () => {
      mockExistsSync.mockReturnValue(true);

      const coverageSummary1 = JSON.stringify({
        total: {
          lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
          branches: { total: 50, covered: 40, skipped: 0, pct: 80 },
        },
        '/home/user/project/packages/lib1/src/index.ts': {
          lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
        },
      });

      const coverageSummary2 = JSON.stringify({
        total: {
          lines: { total: 200, covered: 150, skipped: 0, pct: 75 },
          branches: { total: 100, covered: 90, skipped: 0, pct: 90 },
        },
        '/home/user/project/packages/lib2/src/index.ts': {
          lines: { total: 200, covered: 150, skipped: 0, pct: 75 },
        },
      });

      // For sonar-report.xml findFiles
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // For coverage-summary.json findFiles
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
        { name: 'pkg2', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-summary.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-summary.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      // For coverage-final.json findFiles
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // For lcov.info findFiles
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);

        if (pathStr.includes('pkg1')) return coverageSummary1;
        if (pathStr.includes('pkg2')) return coverageSummary2;

        return '';
      });

      await combineCoverageReports();

      const content = getWriteCallContent('combined-coverage-summary.json');
      const writtenSummary = JSON.parse(content) as Record<string, unknown>;

      // Check that totals are merged
      expect(writtenSummary['total']).toEqual({
        lines: { total: 300, covered: 230, skipped: 0, pct: 76.67 },
        branches: { total: 150, covered: 130, skipped: 0, pct: 86.67 },
      });

      // Check that absolute paths are normalized to relative
      const keys = Object.keys(writtenSummary);

      expect(keys).not.toContain('/home/user/project/packages/lib1/src/index.ts');
      expect(keys).toContain(normalize('packages/lib1/src/index.ts'));
      expect(keys).toContain(normalize('packages/lib2/src/index.ts'));
    });

    it('should merge coverage summaries for the same file path', async () => {
      mockExistsSync.mockReturnValue(true);

      const coverageSummary1 = JSON.stringify({
        total: {
          lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
        },
        '/home/user/project/packages/lib1/src/index.ts': {
          lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
        },
      });

      const coverageSummary2 = JSON.stringify({
        total: {
          lines: { total: 50, covered: 20, skipped: 0, pct: 40 },
        },
        '/home/user/project/packages/lib1/src/index.ts': {
          lines: { total: 50, covered: 20, skipped: 0, pct: 40 },
        },
      });

      // sonar
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // coverage-summary
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
        { name: 'pkg2', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-summary.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-summary.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      // coverage-final
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // lcov
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockImplementation((path: unknown) => {
        const pathStr = String(path);

        if (pathStr.includes('pkg1')) return coverageSummary1;
        if (pathStr.includes('pkg2')) return coverageSummary2;

        return '';
      });

      await combineCoverageReports();

      const content = getWriteCallContent('combined-coverage-summary.json');
      const writtenSummary = JSON.parse(content) as Record<
        string,
        Record<string, { total: number; covered: number; skipped: number; pct: number }>
      >;

      const fileEntry = writtenSummary[normalize('packages/lib1/src/index.ts')];

      // Metrics should be accumulated
      expect(fileEntry['lines'].total).toBe(150);
      expect(fileEntry['lines'].covered).toBe(100);
      expect(fileEntry['lines'].pct).toBeCloseTo(66.67, 1);
    });

    it('should merge and normalize coverage-final.json files', async () => {
      mockExistsSync.mockReturnValue(true);

      const coverageFinal1 = JSON.stringify({
        '/home/user/project/packages/lib1/src/index.ts': {
          path: '/home/user/project/packages/lib1/src/index.ts',
          statementMap: {},
          s: {},
        },
      });

      // sonar
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // summary
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // coverage-final
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-final.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      // lcov
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockImplementation(() => coverageFinal1);

      await combineCoverageReports();

      const content = getWriteCallContent('combined-coverage-final.json');
      const writtenFinal = JSON.parse(content) as Record<string, Record<string, unknown>>;

      // Check that the key is normalized
      const keys = Object.keys(writtenFinal);

      expect(keys).not.toContain('/home/user/project/packages/lib1/src/index.ts');
      expect(keys).toContain(normalize('packages/lib1/src/index.ts'));

      // Check that the inner path field is also normalized
      const entry = writtenFinal[normalize('packages/lib1/src/index.ts')];

      expect(entry['path']).toBe(normalize('packages/lib1/src/index.ts'));
    });

    it('should handle coverage-final entries without a path field', async () => {
      mockExistsSync.mockReturnValue(true);

      const coverageFinal = JSON.stringify({
        '/home/user/project/packages/lib1/src/utils.ts': {
          statementMap: {},
          s: {},
        },
      });

      // sonar
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // summary
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // coverage-final
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'coverage-final.json', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);
      // lcov
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockImplementation(() => coverageFinal);

      await combineCoverageReports();

      const content = getWriteCallContent('combined-coverage-final.json');
      const writtenFinal = JSON.parse(content) as Record<string, Record<string, unknown>>;
      const entry = writtenFinal[normalize('packages/lib1/src/utils.ts')];

      // path field should not exist since original didn't have one
      expect(entry['path']).toBeUndefined();
    });

    it('should combine and normalize lcov.info files', async () => {
      mockExistsSync.mockReturnValue(true);

      const lcovContent = 'SF:../../packages/lib1/src/index.ts\nDA:1,1\nend_of_record\n';

      // sonar
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // summary
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // final
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // lcov.info
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'lcov.info', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockReturnValue(lcovContent);

      await combineCoverageReports();

      const writtenLcov = getWriteCallContent('combined-lcov.info');

      // SF lines should not start with ../../
      expect(writtenLcov).not.toContain('SF:../../');
      // Non-SF lines preserved
      expect(writtenLcov).toContain('DA:1,1');
      expect(writtenLcov).toContain('end_of_record');
    });

    it('should combine multiple lcov.info files into one', async () => {
      mockExistsSync.mockReturnValue(true);

      const lcov1 = 'SF:src/a.ts\nDA:1,1\nend_of_record\n';
      const lcov2 = 'SF:src/b.ts\nDA:2,1\nend_of_record\n';

      // sonar
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // summary
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);
      // final
      mockReaddirSync.mockReturnValueOnce([] as unknown as ReturnType<typeof readdirSync>);

      // lcov
      mockReaddirSync.mockReturnValueOnce([
        { name: 'pkg1', isDirectory: () => true, isFile: () => false },
        { name: 'pkg2', isDirectory: () => true, isFile: () => false },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'lcov.info', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);
      mockReaddirSync.mockReturnValueOnce([
        { name: 'lcov.info', isDirectory: () => false, isFile: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

      mockReadFileSync.mockReturnValueOnce(lcov1).mockReturnValueOnce(lcov2);

      await combineCoverageReports();

      const writtenLcov = getWriteCallContent('combined-lcov.info');

      // Both records should be present
      expect(writtenLcov).toContain('DA:1,1');
      expect(writtenLcov).toContain('DA:2,1');
      // Should have two end_of_record entries
      expect(writtenLcov.match(/end_of_record/g)).toHaveLength(2);
    });
  });
});

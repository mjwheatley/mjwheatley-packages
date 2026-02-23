import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, normalize } from 'node:path';

import { parseStringPromise, Builder } from 'xml2js';

/**
 * Normalize absolute file paths to be relative to the project root.
 */
export const normalizeFilePath = (absolutePath: string, projectRoot: string): string => {
  return normalize(relative(projectRoot, absolutePath));
};

interface TestCase {
  $: {
    name: string; // The name of the test case
    duration: string; // The duration of the test case, as a string
  };
  skipped?: {
    $: {
      message: string; // Optional skipped message
    };
  }[];
}

interface File {
  $: {
    path: string; // Path to the test file
  };
  testCase: TestCase[];
}

interface TestExecutions {
  $: {
    version: string; // Version of the testExecutions XML
  };
  file: File[];
}

interface ParsedXml {
  testExecutions: TestExecutions;
}

// Define the interface for coverage summary
interface CoverageMetrics {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface CoverageSummary {
  total: Record<string, CoverageMetrics>;
  [filePath: string]: Record<string, CoverageMetrics>;
}

type CoverageFinal = Record<string, Record<string, unknown>>;

export const combineSonarReports = async (inputFiles: string[], outputFile: string): Promise<void> => {
  try {
    const combinedTestExecutions: { file: File[] } = { file: [] };

    // Process each input file
    for (const inputFile of inputFiles) {
      const xmlContent = readFileSync(inputFile, 'utf-8');
      // eslint-disable-next-line no-await-in-loop
      const parsedXml: ParsedXml = (await parseStringPromise(xmlContent)) as ParsedXml;

      combinedTestExecutions.file.push(...parsedXml.testExecutions.file);
    }

    // Deduplicate files by `path` attribute
    const deduplicatedFiles = Object.values(
      combinedTestExecutions.file.reduce<Record<string, File>>((acc, file) => {
        const filePath = file.$.path;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!acc[filePath]) {
          acc[filePath] = file;
        } else {
          // Merge test cases if a file path already exists
          acc[filePath].testCase.push(...file.testCase);
        }

        return acc;
      }, {}),
    );

    // Create the final XML structure
    const finalXml = {
      testExecutions: {
        $: { version: '1' },
        file: deduplicatedFiles,
      },
    };

    // Build XML string
    const builder = new Builder();
    const xmlString = builder.buildObject(finalXml);

    // Write to the output file
    writeFileSync(outputFile, xmlString, 'utf-8');
    console.log(`Combined sonar reports saved to ${outputFile}`);
  } catch (error) {
    console.error('Error combining sonar reports:', error);
  }
};

/**
 * Merges multiple coverage summaries into a single coverage summary.
 * @param files An array of paths to `coverage-summary.json` files.
 * @returns A merged coverage summary object.
 */
const mergeCoverageSummaries = (files: string[]): CoverageSummary => {
  const merged: CoverageSummary = { total: {} };

  for (const file of files) {
    const content = JSON.parse(readFileSync(file, 'utf-8')) as CoverageSummary;

    // Merge `total` section
    for (const [metric, values] of Object.entries(content.total)) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!merged.total[metric]) {
        merged.total[metric] = { ...values };
      } else {
        merged.total[metric].total += values.total;
        merged.total[metric].covered += values.covered;
        merged.total[metric].skipped += values.skipped;
        merged.total[metric].pct = Number(
          ((merged.total[metric].covered / merged.total[metric].total) * 100).toFixed(2),
        );
      }
    }

    // Merge per-file coverage
    for (const [filePath, fileCoverage] of Object.entries(content)) {
      if (filePath === 'total') continue;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!merged[filePath]) {
        merged[filePath] = { ...fileCoverage };
      } else {
        for (const [metric, values] of Object.entries(fileCoverage)) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!merged[filePath][metric]) {
            merged[filePath][metric] = { ...values };
          } else {
            merged[filePath][metric].total += values.total;
            merged[filePath][metric].covered += values.covered;
            merged[filePath][metric].skipped += values.skipped;
            merged[filePath][metric].pct = Number(
              ((merged[filePath][metric].covered / merged[filePath][metric].total) * 100).toFixed(2),
            );
          }
        }
      }
    }
  }

  return merged;
};

/**
 * Merges multiple coverage-final.json objects into one.
 * @param coverageFinals - An array of coverage data objects.
 * @returns A single merged coverage data object.
 */
const mergeCoverageFinals = (coverageFinals: string[]): CoverageFinal => {
  return coverageFinals.reduce((acc, filePath) => {
    const coverageFinal = JSON.parse(readFileSync(filePath, 'utf-8')) as CoverageFinal;

    Object.assign(acc, coverageFinal);

    return acc;
  }, {});
};

/**
 * Recursively traverses a directory to find files matching a specific pattern.
 * @param dir The starting directory to traverse.
 * @param targetFile The name of the file to search for.
 * @returns An array of paths to matching files.
 */
export const findFiles = (dir: string, targetFile: string): string[] => {
  const result: string[] = [];

  // Read the contents of the directory
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search in subdirectories
      result.push(...findFiles(fullPath, targetFile));
    } else if (entry.isFile() && entry.name === targetFile) {
      // Add a matching file to the result
      result.push(fullPath);
    }
  }

  return result;
};

/**
 * Combines all coverage reports (sonar, summary, final, lcov) from the coverage directory.
 * Normalizes file paths to be relative to the project root.
 */
export const combineCoverageReports = async (): Promise<void> => {
  const cwd = process.cwd();
  const rootDir = join(cwd, 'coverage');
  const outputDir = join(cwd, 'coverage');

  if (!existsSync(rootDir)) {
    mkdirSync(rootDir, { recursive: true });
  }

  /**
   * Combine sonar-report.xml files
   * **/
  let targetFile = 'sonar-report.xml';
  let files: string[];
  let outputFile = join(outputDir, 'combined-sonar-report.xml');

  files = findFiles(rootDir, targetFile);

  console.log(`Found ${String(files.length)} ${targetFile} files in ${rootDir}`);
  await combineSonarReports(files, outputFile);

  /**
   * Combine coverage-summary.json files
   * **/
  targetFile = 'coverage-summary.json';
  outputFile = join(outputDir, 'combined-coverage-summary.json');

  files = findFiles(rootDir, targetFile);
  console.log(`Found ${String(files.length)} ${targetFile} files:`);

  const mergedSummary = mergeCoverageSummaries(files);

  const normalizedSummary: CoverageSummary = { total: mergedSummary.total };

  for (const [absPath, fileCoverage] of Object.entries(mergedSummary)) {
    if (absPath === 'total') continue;

    const relPath = normalizeFilePath(absPath, cwd);

    normalizedSummary[relPath] = fileCoverage;
  }

  writeFileSync(outputFile, JSON.stringify(normalizedSummary, null, 2), 'utf-8');
  console.log(`Normalized and merged coverage summary saved to ${outputFile}`);

  /**
   * Combine coverage-final.json files
   * **/
  targetFile = 'coverage-final.json';
  outputFile = join(outputDir, 'combined-coverage-final.json');

  files = findFiles(rootDir, targetFile);
  console.log(`Found ${String(files.length)} ${targetFile} files:`);

  const mergedCoverageFinals = mergeCoverageFinals(files);

  const normalizedCoverageFinals: CoverageFinal = {};

  for (const [absPath, coverageData] of Object.entries(mergedCoverageFinals)) {
    const relPath = normalizeFilePath(absPath, cwd);

    // Also update the "path" field inside each entry if it exists
    if ('path' in coverageData && typeof coverageData['path'] === 'string') {
      coverageData['path'] = normalizeFilePath(coverageData['path'], cwd);
    }

    normalizedCoverageFinals[relPath] = coverageData;
  }

  writeFileSync(outputFile, JSON.stringify(normalizedCoverageFinals, null, 2), 'utf-8');
  console.log(`Normalized and merged coverage-final saved to ${outputFile}`);

  /**
   * Combine lcov.info files
   * **/
  targetFile = 'lcov.info';
  outputFile = join(outputDir, 'combined-lcov.info');

  files = findFiles(rootDir, targetFile);
  console.log(`Found ${String(files.length)} ${targetFile} files:`);

  // Store normalized lcov contents here
  let combinedLcovContent = '';

  for (const filePath of files) {
    const lcovContent = readFileSync(filePath, 'utf-8');
    const fileDir = dirname(filePath);

    // Normalize each SF line
    const normalizedContent = lcovContent.replace(/^SF:(.*)$/gm, (_, originalPath: string) => {
      const absPath = join(fileDir, originalPath);
      const relPath = normalizeFilePath(absPath, cwd);
      const cleanedPath = relPath.replace(/^coverage[\\/]/, '');

      return `SF:${cleanedPath}`;
    });

    combinedLcovContent += `${normalizedContent}\n`;
  }

  writeFileSync(outputFile, combinedLcovContent, 'utf-8');
  console.log(`Normalized and merged lcov saved to ${outputFile}`);
};

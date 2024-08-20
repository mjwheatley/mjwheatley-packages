import { describe, it, expect, vi, Mock } from 'vitest';
import * as yargs from 'yargs';
import { getOptions } from './options';

vi.mock('yargs', () => {
  return {
    version: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    parseAsync: vi.fn(),
  };
});

describe('getOptions()', () => {
  it('should return the default options', async () => {
    const mockParseAsync = yargs.parseAsync as Mock;
    mockParseAsync.mockResolvedValue({
      version: undefined,
      dryRun: true,
      verbose: false,
      firstRelease: false,
    });

    const options = await getOptions();

    expect(options).toEqual({
      version: undefined,
      dryRun: true,
      verbose: false,
      firstRelease: false,
    });
  });

  it('should return the provided options', async () => {
    const mockParseAsync = yargs.parseAsync as Mock;
    mockParseAsync.mockResolvedValue({
      version: '1.0.0',
      dryRun: false,
      verbose: true,
      firstRelease: true,
    });

    const options = await getOptions();

    expect(options).toEqual({
      version: '1.0.0',
      dryRun: false,
      verbose: true,
      firstRelease: true,
    });
  });
});

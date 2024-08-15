import { describe, expect, it } from 'vitest';
import { packageOne } from '../index.js';

describe('packageOne', () => {
  it('should work', () => {
    expect(packageOne()).toEqual('package-one');
  });
});

import { describe, expect, it } from 'vitest';
import { packageTwo } from '../index.js';

describe('packageTwo', () => {
  it('should work', () => {
    expect(packageTwo()).toEqual('package-two');
  });
});

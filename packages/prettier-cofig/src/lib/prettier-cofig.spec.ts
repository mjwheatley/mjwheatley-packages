import { prettierConfig } from './prettier-cofig';

describe('prettierCofig', () => {
  it('should work', () => {
    expect(prettierConfig).toEqual(expect.objectContaining({
      singleQuote: true,
    }));
  });
});

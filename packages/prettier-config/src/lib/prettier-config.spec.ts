import { prettierConfig } from "./prettier-config";

describe("prettierCofig", () => {
  it("should work", () => {
    expect(prettierConfig).toEqual(
      expect.objectContaining({
        singleQuote: true,
      })
    );
  });
});

import { packageOne } from "./package-one";

describe("packageOne", () => {
  it("should work", () => {
    expect(packageOne()).toEqual("package-one");
  });
});

import { cspellDictionary } from "./cspell-dictionary";

describe("cspellDictionary", () => {
  it("should export a dictionary of words", () => {
    expect(cspellDictionary).toEqual(
      expect.objectContaining({
        dictionaries: expect.any(Array),
        dictionaryDefinitions: expect.any(Array),
      })
    );
  });
});

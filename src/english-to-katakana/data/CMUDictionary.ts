import dictionaryData from "./cmu_dictionary.json";
// import dictionaryData2 from "../dictionary/ipa_dictionary.json" assert { type: "json" };

export class CMUDictionary {
  private static dictionary: Map<string, string[]> = new Map(
    Object.entries(dictionaryData)
  );

  public static get(word: string): string[] | undefined {
    return this.dictionary.get(word.toLowerCase());
  }
}

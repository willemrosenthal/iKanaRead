import { ICreator } from "../types";

export class MoraeCreator implements ICreator {
  private vowels = "aeiou";

  public create(ph: string): string {
    let result = ph[0];
    let pIdx = 1;

    while (pIdx < ph.length) {
      // Previous char is vowel
      if (this.vowels.includes(ph[pIdx - 1])) {
        result += "." + ph[pIdx];
      }
      // Previous char is consonant
      else {
        // Geminate consonant
        if (ph[pIdx - 1] === ph[pIdx] || ph[pIdx - 1] === "N") {
          result += "." + ph[pIdx];
        } else {
          result += ph[pIdx];
        }
      }
      pIdx++;
    }
    return result;
  }
}

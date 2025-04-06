import { IHandler } from "../types";

export class EpentheticVowelHandler implements IHandler {
  private vowels = "aeiou";
  private consym = "bdfghjkmprstz";

  // Rule implementations
  private dtRule = (ph: string, pIdx: number): string => {
    // d, t
    if (pIdx === ph.length - 1) {
      return ph[pIdx] + "o";
    } else if (
      pIdx + 1 < ph.length &&
      ph[pIdx] !== ph[pIdx + 1] &&
      !this.vowels.includes(ph[pIdx + 1])
    ) {
      return ph[pIdx] + "o";
    }
    return ph[pIdx];
  };

  private bfprzRule = (ph: string, pIdx: number): string => {
    // b, f, p, r, z
    if (pIdx === ph.length - 1) {
      return ph[pIdx] + "u";
    } else if (
      pIdx + 1 < ph.length &&
      ph[pIdx] !== ph[pIdx + 1] &&
      ph[pIdx + 1] !== "y" &&
      !this.vowels.includes(ph[pIdx + 1])
    ) {
      return ph[pIdx] + "u";
    }
    return ph[pIdx];
  };

  private kgmRule = (ph: string, pIdx: number): string => {
    // k, g, m
    if (pIdx === ph.length - 1) {
      return ph[pIdx] + "u";
    } else if (
      pIdx + 1 < ph.length &&
      ph[pIdx] !== ph[pIdx + 1] &&
      ph[pIdx + 1] !== "y" &&
      ph[pIdx + 1] !== "w" &&
      !this.vowels.includes(ph[pIdx + 1])
    ) {
      return ph[pIdx] + "u";
    }
    return ph[pIdx];
  };

  private hRule = (ph: string, pIdx: number): string => {
    // cch, ssh
    if (
      pIdx >= 1 &&
      ph[pIdx - 1] === "c" &&
      (pIdx === ph.length - 1 || !this.vowels.includes(ph[pIdx + 1]))
    ) {
      return "hi";
    } else if (
      pIdx >= 1 &&
      ph[pIdx - 1] === "s" &&
      (pIdx === ph.length - 1 || !this.vowels.includes(ph[pIdx + 1]))
    ) {
      return "hu";
    } else if (pIdx + 1 < ph.length && ph[pIdx + 1] === "w") {
      return "ho";
    }
    return "h";
  };

  private sRule = (ph: string, pIdx: number): string => {
    if (pIdx === ph.length - 1) {
      return "su";
    } else if (
      pIdx + 1 < ph.length &&
      ph[pIdx] !== ph[pIdx + 1] &&
      ph[pIdx + 1] !== "h" &&
      !this.vowels.includes(ph[pIdx + 1])
    ) {
      return "su";
    }
    return "s";
  };

  private jRule = (ph: string, pIdx: number): string => {
    if (pIdx === ph.length - 1) {
      return "ji";
    } else if (pIdx + 1 < ph.length && !this.vowels.includes(ph[pIdx + 1])) {
      if (ph[pIdx + 1] === "j" || ph[pIdx + 1] === "y") {
        return "j";
      }
      return "ji";
    }
    return "j";
  };

  private epentheticMap: {
    [key: string]: (ph: string, pIdx: number) => string;
  } = {
    b: this.bfprzRule,
    d: this.dtRule,
    f: this.bfprzRule,
    g: this.kgmRule,
    h: this.hRule,
    j: this.jRule,
    k: this.kgmRule,
    m: this.kgmRule,
    p: this.bfprzRule,
    r: this.bfprzRule,
    s: this.sRule,
    t: this.dtRule,
    z: this.bfprzRule,
  };

  public handle(ph: string): string {
    let result = "";
    let pIdx = 0;

    while (pIdx < ph.length) {
      while (pIdx < ph.length && !this.consym.includes(ph[pIdx])) {
        if (
          pIdx >= 2 &&
          ph[pIdx] === ph[pIdx - 1] &&
          ph[pIdx] === ph[pIdx - 2]
        ) {
          // Skip if same vowel continues more than two times
        } else {
          result += ph[pIdx];
        }
        pIdx++;
      }

      if (pIdx < ph.length && this.consym.includes(ph[pIdx])) {
        result += this.epentheticMap[ph[pIdx]](ph, pIdx);
        pIdx++;
      }
    }
    return result;
  }
}

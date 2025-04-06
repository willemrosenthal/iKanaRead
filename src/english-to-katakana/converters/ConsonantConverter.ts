interface IConverter {
  convert(word: string, ph: string): string;
}

export class ConsonantConverter implements IConverter {
  private vowels = "aeiou";
  private consonants = "dgʤʒklmnptvʧŋɹʃðθ";

  public convert(word: string, ph: string): string {
    let result = "";
    let pIdx = 0;

    while (pIdx < ph.length) {
      // Add vowel chars as is
      while (pIdx < ph.length && !this.consonants.includes(ph[pIdx])) {
        result += ph[pIdx];
        pIdx++;
      }

      // Convert consonant
      if (pIdx < ph.length && this.consonants.includes(ph[pIdx])) {
        result += this.consonantMap[ph[pIdx]](word, ph, pIdx);
        pIdx++;
      }
    }
    return result;
  }

  private gkptRule = (word: string, ph: string, pIdx: number): string => {
    // k, g, p, t -- kk, gg, pp, tt
    // two letters, eʤ, æt or ʌp
    if (ph.length === 2 && pIdx === 1) {
      return ph[pIdx] + ph[pIdx];
    }
    // exception: original word contains apple, like apple, pineapple, applebee -- apul
    else if (
      pIdx - 1 >= 0 &&
      pIdx + 2 < ph.length &&
      ph[pIdx - 1] === "a" &&
      ph[pIdx + 1] === "u" &&
      ph[pIdx + 2] === "l"
    ) {
      return ph[pIdx] + ph[pIdx];
    }
    // after 3 vowel sounds, like pooet
    else if (
      pIdx >= 3 &&
      this.vowels.includes(ph[pIdx - 1]) &&
      this.vowels.includes(ph[pIdx - 2]) &&
      this.vowels.includes(ph[pIdx - 3])
    ) {
      return ph[pIdx] + ph[pIdx];
    }
    // after consonant and a single vowel, like kwip
    // not followed by a vowel, not like maʤoɹitii
    else if (
      pIdx >= 2 &&
      this.vowels.includes(ph[pIdx - 1]) &&
      !this.vowels.includes(ph[pIdx - 2]) &&
      (pIdx === ph.length - 1 || !this.vowels.includes(ph[pIdx + 1]))
    ) {
      return ph[pIdx] + ph[pIdx];
    }
    return ph[pIdx];
  };

  private dRule = (word: string, ph: string, pIdx: number): string => {
    if (pIdx + 1 < ph.length && ph[pIdx + 1] === "z") {
      return "z";
    } else if (
      pIdx >= 1 &&
      this.vowels.includes(ph[pIdx - 1]) &&
      (ph.length <= 2 || !this.vowels.includes(ph[pIdx - 2]))
    ) {
      return "dd";
    }
    return "d";
  };

  private dgRule = (word: string, ph: string, pIdx: number): string => {
    if (pIdx >= 1 && this.vowels.includes(ph[pIdx - 1])) {
      if (ph.length <= 2) {
        return "jj";
      } else if (pIdx + 1 < ph.length && this.vowels.includes(ph[pIdx + 1])) {
        return "j";
      } else if (pIdx - 2 >= 0 && !this.vowels.includes(ph[pIdx - 2])) {
        return "jj";
      } else {
        return "j";
      }
    }
    return "j";
  };

  private gShortRule = (): string => "j";

  private lRule = (): string => "r";

  private mnRule = (word: string, ph: string, pIdx: number): string => {
    if (
      pIdx > 0 &&
      pIdx + 1 < ph.length &&
      !this.vowels.includes(ph[pIdx + 1]) &&
      ph[pIdx + 1] !== "y"
    ) {
      return "N";
    } else if (pIdx === ph.length - 1 && ph[pIdx] === "n") {
      return "N";
    }
    return ph[pIdx];
  };

  private vRule = (): string => "b";

  private tshRule = (word: string, ph: string, pIdx: number): string => {
    if (
      pIdx >= 1 &&
      this.vowels.includes(ph[pIdx - 1]) &&
      (ph.length <= 2 || !this.vowels.includes(ph[pIdx - 2]))
    ) {
      return "cch";
    }
    return "ch";
  };

  private ngRule = (word: string, ph: string, pIdx: number): string => {
    if (pIdx + 1 < ph.length && ph[pIdx + 1] === "g") {
      return "N";
    } else if (word.includes("ng")) {
      return "Ng";
    }
    return "N";
  };

  private rRule = (): string => "r";

  private shRule = (word: string, ph: string, pIdx: number): string => {
    if (
      pIdx >= 1 &&
      this.vowels.includes(ph[pIdx - 1]) &&
      (ph.length <= 2 || !this.vowels.includes(ph[pIdx - 2]))
    ) {
      return "ssh";
    }
    return "sh";
  };

  private thHakuonRule = (): string => "z";

  private thClearRule = (): string => "s";

  private consonantMap: {
    [key: string]: (word: string, ph: string, pIdx: number) => string;
  } = {
    d: this.dRule,
    g: this.gkptRule,
    ʤ: this.dgRule,
    ʒ: this.gShortRule,
    k: this.gkptRule,
    l: this.lRule,
    m: this.mnRule,
    n: this.mnRule,
    p: this.gkptRule,
    t: this.gkptRule,
    v: this.vRule,
    ʧ: this.tshRule,
    ŋ: this.ngRule,
    ɹ: this.rRule,
    ʃ: this.shRule,
    ð: this.thHakuonRule,
    θ: this.thClearRule,
  };
}

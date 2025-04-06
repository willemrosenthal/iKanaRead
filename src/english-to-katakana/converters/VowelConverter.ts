import { IConverter } from "../types";

export class VowelConverter implements IConverter {
  private vowels = "aeiou";
  private vowsyms = "aɑʌɚæeɛɪijɔoʊu";

  // Rule implementations
  private ajRule = (word: string, wIdx: number): string => "ai";

  private arRule = (word: string, wIdx: number): string => "aa";

  private awRule = (word: string, wIdx: number): string => "au";

  private aShortRule = (word: string, wIdx: number): string => {
    if (wIdx < word.length && word[wIdx] === "o") {
      return "o";
    }
    return "a";
  };

  private aLongRule = (word: string, wIdx: number): string => "aa";

  private aeRule = (word: string, wIdx: number): string => {
    if (
      wIdx < word.length &&
      wIdx >= 1 &&
      (word[wIdx - 1] === "c" || word[wIdx - 1] === "g")
    ) {
      return "ya";
    }
    return "a";
  };

  private hatRule = (word: string, wIdx: number): string => {
    if (
      wIdx + 1 < word.length &&
      word[wIdx] === "o" &&
      word[wIdx + 1] === "u"
    ) {
      return "a";
    } else if (
      wIdx + 1 < word.length &&
      word[wIdx] === "i" &&
      word[wIdx + 1] === "o"
    ) {
      return "o";
    } else if (
      wIdx > 0 &&
      wIdx < word.length &&
      word[wIdx] === "e" &&
      word[wIdx - 1] === "l"
    ) {
      if (wIdx - 2 >= 0 && ["d", "t"].includes(word[wIdx - 2])) {
        return "o";
      } else if (wIdx + 1 < word.length && word[wIdx + 1] === "t") {
        return "e";
      } else {
        return "u";
      }
    } else if (
      wIdx > 0 &&
      wIdx < word.length &&
      word[wIdx] === "u" &&
      word[wIdx - 1] === "j"
    ) {
      return "ya";
    } else if (wIdx < word.length && word[wIdx] === "o" && word !== "mother") {
      return "o";
    } else if (wIdx < word.length && word[wIdx] === "e") {
      return "e";
    } else if (wIdx < word.length && word[wIdx] === "i") {
      return "i";
    }
    return "a";
  };

  private ejRule = (word: string, wIdx: number): string => "ei";

  private erRule = (word: string, wIdx: number): string => "eaa";

  private eRule = (word: string, wIdx: number): string => "e";

  private irRule = (word: string, wIdx: number): string => "iaa";

  private iirLongRule = (word: string, wIdx: number): string => "iaa";

  private iLongRule = (word: string, wIdx: number): string => "ii";

  private iShortRule = (word: string, wIdx: number): string => "i";

  private jaRule = (word: string, wIdx: number): string => "yaa";

  private jaShortRule = (word: string, wIdx: number): string => "ya";

  private jawRule = (word: string, wIdx: number): string => "yoo";

  private juRule = (word: string, wIdx: number): string => "yuu";

  private juShortRule = (word: string, wIdx: number): string => "yu";

  private jiRule = (word: string, wIdx: number): string => "ii";

  private jeRule = (word: string, wIdx: number): string => "ie";

  private jejRule = (word: string, wIdx: number): string => "yei";

  private jowRule = (word: string, wIdx: number): string => "yoo";

  private joRule = (word: string, wIdx: number): string => "yo";

  private ojRule = (word: string, wIdx: number): string => "oi";

  private orRule = (word: string, wIdx: number): string => "oo";

  private owRule = (word: string, wIdx: number): string => "oo";

  private oRule = (word: string, wIdx: number): string => {
    if (
      wIdx + 1 < word.length &&
      word[wIdx] === "a" &&
      word[wIdx + 1] === "u"
    ) {
      return "oo";
    }
    return "o";
  };

  private jurRule = (word: string, wIdx: number): string => "yuaa";

  private jsiRule = (word: string, wIdx: number): string => "ji";

  private urRule = (word: string, wIdx: number): string => "uaa";

  private uShortRule = (word: string, wIdx: number): string => "u";

  private uLongRule = (word: string, wIdx: number): string => "uu";

  private jRule = (word: string, wIdx: number): string => "ji";

  private vowelMap: { [key: string]: (word: string, wIdx: number) => string } =
    {
      aj: this.ajRule,
      ɑj: this.ajRule,
      ɑɹ: this.arRule,
      aw: this.awRule,
      ɑw: this.arRule,
      ɑ: this.aShortRule,
      ɚ: this.aLongRule,
      æ: this.aeRule,
      ʌ: this.hatRule,
      ej: this.ejRule,
      ɛɹ: this.erRule,
      ɛ: this.eRule,
      ɪɹ: this.irRule,
      i: this.iLongRule,
      iɹ: this.iirLongRule,
      ɪ: this.iShortRule,
      jʌ: this.jaRule,
      jɑ: this.jaShortRule,
      jæ: this.jaShortRule,
      jaw: this.jawRule,
      ju: this.juRule,
      jɚ: this.juShortRule,
      jʊ: this.juShortRule,
      ji: this.jiRule,
      jɪ: this.jeRule,
      jɛ: this.jeRule,
      jej: this.jejRule,
      jow: this.jowRule,
      jɔ: this.joRule,
      jsi: this.jsiRule,
      ɔj: this.ojRule,
      ʌj: this.ojRule,
      ɔɹ: this.orRule,
      ow: this.owRule,
      ɔ: this.oRule,
      jʊɹ: this.jurRule,
      ʊɹ: this.urRule,
      ʊ: this.uShortRule,
      u: this.uLongRule,
      j: this.jRule,
    };

  public convert(word: string, ph: string): string {
    let result = "";
    let wIdx = 0;
    let pIdx = 0;

    while (pIdx < ph.length) {
      // Skip consonants in word
      while (
        wIdx < word.length &&
        !this.vowels.includes(word[wIdx]) &&
        !["y", "'"].includes(word[wIdx])
      ) {
        wIdx++;
      }

      // Add consonant phonetics
      while (pIdx < ph.length && !this.vowsyms.includes(ph[pIdx])) {
        result += ph[pIdx];
        pIdx++;
      }

      // Convert vowel phonetics
      while (pIdx < ph.length && this.vowsyms.includes(ph[pIdx])) {
        if (
          wIdx + 1 < word.length &&
          word[wIdx] === "u" &&
          this.vowels.includes(word[wIdx + 1])
        ) {
          wIdx++;
        }

        if (pIdx + 3 <= ph.length && this.vowelMap[ph.slice(pIdx, pIdx + 3)]) {
          result += this.vowelMap[ph.slice(pIdx, pIdx + 3)](word, wIdx);
          pIdx += 3;
          wIdx++;
        } else if (
          pIdx + 2 <= ph.length &&
          this.vowelMap[ph.slice(pIdx, pIdx + 2)] &&
          (pIdx + 2 === ph.length ||
            ph[pIdx + 1] !== "ɹ" ||
            !this.vowsyms.includes(ph[pIdx + 2]))
        ) {
          result += this.vowelMap[ph.slice(pIdx, pIdx + 2)](word, wIdx);
          pIdx += 2;
          wIdx++;
        } else if (this.vowelMap[ph[pIdx]]) {
          result += this.vowelMap[ph[pIdx]](word, wIdx);
          pIdx++;
          wIdx++;
        } else if (pIdx === ph.length - 1 && ph[pIdx] === "j") {
          result += this.vowelMap[ph[pIdx]](word, wIdx);
          pIdx++;
        }
      }

      // Skip rest of vowel chars
      while (wIdx < word.length && this.vowels.includes(word[wIdx])) {
        wIdx++;
      }
    }

    // Add rest of consonant symbols
    while (pIdx < ph.length) {
      result += ph[pIdx];
      pIdx++;
    }

    return result;
  }
}

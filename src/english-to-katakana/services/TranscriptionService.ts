import { CMUDictionary } from "../data/CMUDictionary";
import { VowelConverter } from "../converters/VowelConverter";
import { ConsonantConverter } from "../converters/ConsonantConverter";
import { EpentheticVowelHandler } from "../handlers/EpentheticVowelHandler";
import { MoraeCreator } from "../creators/MoraeCreator";
import { MoraeKanaConverter } from "../converters/MoraeKanaConverter";
import { TranscriptionResult } from "../types";

export class TranscriptionService {
  private vowelConverter: VowelConverter;
  private consonantConverter: ConsonantConverter;
  private epentheticHandler: EpentheticVowelHandler;
  private moraeCreator: MoraeCreator;
  private kanaConverter: MoraeKanaConverter;

  constructor() {
    this.vowelConverter = new VowelConverter();
    this.consonantConverter = new ConsonantConverter();
    this.epentheticHandler = new EpentheticVowelHandler();
    this.moraeCreator = new MoraeCreator();
    this.kanaConverter = new MoraeKanaConverter();
  }

  public transcriptWord(
    word: string,
    originalWord?: string
  ): TranscriptionResult {
    try {
      let phonetics = CMUDictionary.get(word);

      // create a fallback that breaks words down into syllables, and then uses the phonetic transcription of each syllable
      if (!phonetics) {
        // // return { original: word, katakana: ["E_DIC"] };
        // const syllables = word.split(/([aeiouy]+)/);
        // const syllablePhonetics = syllables.map((syllable) =>
        //   CMUDictionary.get(syllable)
        // );
        // // const flattenedSyllablePhonetics = syllablePhonetics.flat();
        // console.log(syllablePhonetics);
        // phonetics = [syllablePhonetics.flat().join("")];
        // if (!phonetics[0]) {
        return { original: originalWord || word, katakana: ["E_DIC"] };
        // }
      }

      const withVowels = phonetics.map((ph) =>
        this.vowelConverter.convert(word, ph)
      );
      const withConsonants = withVowels.map((ph) =>
        this.consonantConverter.convert(word, ph)
      );
      const withEpenthetic = withConsonants.map((ph) =>
        this.epentheticHandler.handle(ph)
      );
      const morae = withEpenthetic.map((ph) => this.moraeCreator.create(ph));

      const katakana = morae.map((m) => this.kanaConverter.convert(m));

      return { original: originalWord || word, katakana };
    } catch (error) {
      return { original: originalWord || word, katakana: ["E_KEY"] };
    }
  }

  public transcriptWords(words: string[]): TranscriptionResult[] {
    return words.map((word) => this.transcriptWord(word));
  }
}

const transcriptionService = new TranscriptionService();

const sentence = "What's you'r fav color?";

export function splitSentence(sentence: string) {
  if (!sentence || typeof sentence !== "string") {
    return [];
  }

  // Step 0: Replace "-" with " "
  const sentenceWithHyphens = sentence.replace(/-/g, " ");

  // Step 1: Temporarily protect contractions by replacing apostrophes in contractions
  // Common contractions like don't, can't, won't, etc.
  const protectedSentence = sentenceWithHyphens.replace(
    /(\w)\'(\w+)/g,
    "$1APOSTROPHE$2"
  );

  // Step 2: Add spaces around punctuation except for the protected apostrophes
  const spacedPunctuation = protectedSentence.replace(
    /([.,!?;:"\(\)\[\]{}""])/g, // Added hyphen to the character set
    " $1 "
  );

  // Step 3: Split by spaces and filter out empty strings
  const roughSplit = spacedPunctuation
    .split(/\s+/)
    .filter((token) => token.length > 0);

  // Step 4: Restore the apostrophes in contractions
  const finalResult = roughSplit.map((token) =>
    token.replace(/APOSTROPHE/g, "'")
  );

  return finalResult;
}

// console.log(transcriptionService.transcriptWord("fav"));

const transcribeSentence = (sentence: string) => {
  const words = splitSentence(sentence); //sentence.split(" ");
  const transcription = words.map((word) => {
    const noPunctuation = word.replace(
      /[.,\/#!?$%\^&\*;:{}=\-_`~()"""'']/g,
      ""
    );
    // console.log(noPunctuation);
    if (noPunctuation.length === 0)
      return {
        original: word,
        katakana: [engToJapPunctuationMap.get(word) || word],
      };
    return transcriptionService.transcriptWord(noPunctuation);
  });
  return transcription;
};

export const transcribeSentenceArray = (
  sentenceArr: string[]
): TranscriptionResult[] => {
  const transcription = sentenceArr.map((word) => {
    const noPunctuation = word.replace(
      /[.,\/#“”!?$%\^&\*;:{}=\-_`’~()"""''“”—]/g,
      ""
    );
    if (noPunctuation.length === 0)
      return {
        original: word,
        katakana: [engToJapPunctuationMap.get(word) || ` ${word} `],
      };
    return transcriptionService.transcriptWord(noPunctuation, ` ${word} `);
  });
  return transcription;
};

const engToJapPunctuationMap = new Map([
  [".", "。"],
  [",", "、"],
  ["!", "！"],
  ["?", "？"],
  [";", "；"],
  ["(", "（"],
  [")", "）"],
  ["“", "「"],
  ["”", "」"],
]);

const consoleLogTranscription = (transcription: TranscriptionResult[]) => {
  //フェーボリット
  for (const t of transcription) {
    console.log(t.original);
    console.log(t.katakana[0]);
  }
};

// consoleLogTranscription(transcription);
// consoleLogTranscription(transcribeSentence(sentence));
